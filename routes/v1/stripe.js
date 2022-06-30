const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const fetch = require("node-fetch");

const Cart = require("../../models/Cart");
// const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product");

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
// const order = require('../../controllers/v1/ordersController')

router.post("/create-checkout-session", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
async(req, res, next)  => 
{
  try
  {
    let {_id, email, customerId} = req.user, userId = _id, userEmail = email;
    const cart = await Cart.findOne({userId : userId});
    // const {street, zip, city, country, phoneNumber} = req.body;
    
    if(cart)
    {  
      let line_items =  await Promise.all(cart.products.map(
        async(product) => 
        {
          let myProduct =  await Product.findOne({_id : product.productId});
          let name = product.productTitle;
          
          let myProducts = product.productItems.map(productItem =>
            {
              let currency = productItem.price.currency;
              let unitAmountArr = myProduct.productItems.filter(product => product.load === productItem.load);
              let unit_amount = Math.round(unitAmountArr[0].price.value * 100);
              let quantity = productItem.quantity;
              return{
                price_data: 
                {
                  currency: currency,
                  product_data: 
                  {
                    name: name
                  },
                  unit_amount: unit_amount,
                },
                quantity: quantity,
              }
            })
          return myProducts
        }
      ))
      line_items = line_items.flat();
      
      const customer =  await stripe.customers.create();
      
      let customerIdExist = !customerId  ? await User.findOneAndUpdate(
        {_id},
        {
          $set:
          {
            "customerId": customer.id
          }
        },
        {new: true}
      ) : null;
      
      !customerId && await customerIdExist.save();
      let stripeCustomerId = !customerIdExist ? customerId : customerIdExist.customerId;
      
      
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        payment_method_types : ["card", "sepa_debit"],
        customer : stripeCustomerId,
        customer_update : {
          address : "auto",
          name: "auto",
          shipping: "auto"
        },
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'FR', 'PT', 'ES']
        },
        payment_intent_data: {
          setup_future_usage: "off_session",
          receipt_email : userEmail,
          // shipping : {
          //   name : "Maison",
          //   address : 
          //   {
          //     line1 : street,
          //     city : city,
          //     country : "FR",
          //     postal_code : zip,
          //   }
          // }
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        allow_promotion_codes: true,
        success_url: process.env.SERVER_ADDRESS + 'v1/orders/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.SERVER_ADDRESS + 'v1/orders/cancel?session_id={CHECKOUT_SESSION_ID}',
        // customer_email : userEmail,
        // tax_id_collection: {
          //   enabled: true,
        // },
        // shipping_options: [
        //   {
        //     shipping_rate_data: {
        //       type: 'fixed_amount',
        //       fixed_amount: {
        //         amount: 0,
        //         currency: 'eur',
        //       },
        //       display_name: 'Free shipping',
        //       // Delivers between 5-7 business days
        //       delivery_estimate: {
        //         minimum: {
        //           unit: 'business_day',
        //           value: 5,
        //         },
        //         maximum: {
        //           unit: 'business_day',
        //           value: 7,
        //         },
        //       }
        //     }
        //   },
        //   {
        //     shipping_rate_data: {
        //       type: 'fixed_amount',
        //       fixed_amount: {
        //         amount: 1500,
        //         currency: 'eur',
        //       },
        //       display_name: 'Next day air',
        //       // Delivers in exactly 1 business day
        //       delivery_estimate: {
        //         minimum: {
        //           unit: 'business_day',
        //           value: 1,
        //         },
        //         maximum: {
        //           unit: 'business_day',
        //           value: 1,
        //         },
        //       }
        //     }
        //   },
        // ],
      });
    
      setTimeout(async () => 
      {
        const session_id = session.id;
        
        let response = await fetch(process.env.SERVER_ADDRESS + 'v1/orders/cancel?session_id=' + session_id, 
        {
            method: 'GET',
            headers: 
            {
                "Origin": process.env.SERVER_ADDRESS,
            },
        });
        let data = await response.json();
        
        console.log(`data = `, data)
      }, 600000); // 10 minutes = 600000
      
      res.status(200).json(
        {
          success: true,
          url : session.url
        });
    }
    else
    {
      let err = new Error("You have no cart!");
      err.statusCode = 400;
      next(err);
    }
  }catch(err){next(err)}
  
});

module.exports = router;
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');

router.post("/create-checkout-session", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next)  => 
{
  try
  {
    const userId = req.user._id;
    const cart = await Cart.findOne({userId : userId});

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
          
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: process.env.SERVER_ADDRESS + 'success',
        cancel_url: process.env.SERVER_ADDRESS + 'cancel',
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'FR', 'PT', 'ES']
        },
      });
    
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
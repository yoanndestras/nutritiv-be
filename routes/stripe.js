const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// MIDDLEWARES
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');

router.post("/create-checkout-session", auth.verifyUser, auth.verifyRefresh, async(req, res)  => 
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
        success_url: 'http://192.168.1.23:3000/success',
        cancel_url: 'http://192.168.1.23:3000/cancel',
      });
    
      res.status(200).json(
        {
          success: true,
          url : session.url
        });
    }
    else
    {
      res.status(500).json(
        {
            success: false,
            status: "You have no cart!",
        });
    }
  }
  catch(err)
  {
    res.status(500).json(
      {
          success: false,
          status: "Unsuccessfull request!",
          err: err.message
      });
  }
  
});

module.exports = router;
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Cart = require("../models/Cart");

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');


router.get("/secret", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res)  => 
{
  try
  {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({userId : userId});
    let amount =  Math.round(await cart.amount.value * 100);
    let currency = await cart.amount.currency;

    const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amount,
      currency: currency,
      automatic_payment_methods: 
        {
          enabled: true,
        },
    });
    
    res.send(
      {
        clientSecret: paymentIntent.client_secret,
      });
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
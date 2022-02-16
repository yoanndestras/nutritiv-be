const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Cart = require("../models/Cart");

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');


router.post("/create-checkout-session", auth.verifyUser, auth.verifyRefresh, async(req, res)  => 
{
  try
  {
    const userId = req.user._id;
    
    // const cart = await Cart.findOne({userId : userId});
    // let amount =  Math.round(await cart.amount.value * 100);

    // let currency = await cart.amount.currency;
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: 
          {
            currency: "EUR",
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: "12000",
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
  
    res.redirect(303, session.url);
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
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

// MIDDLEWARES
const cors = require('../controllers/cors');


router.post("/payment", cors.corsWithOptions, (req, res)  => 
{
  stripe.charges.create(
  {
    source: req.body.tokenId,
    amount: req.body.amount,
    currency: "eur",
  },
  (stripeErr, stripeRes)  =>
  {
    if(stripeErr)
    {
      res.status(500).json(stripeErr);
    }
    else
    {
      res.status(200).json(stripeRes);
    }
  }
)
});

module.exports = router;
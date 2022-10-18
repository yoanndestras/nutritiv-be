const router = require("express").Router();
const order = require('../../controllers/v1/ordersController')
const paypal = require('../../controllers/v1/paypalController')

// const Cart = require("../../models/Cart");
// const Order = require("../../models/Order");
// const User = require("../../models/User");
// const Product = require("../../models/Product");

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
// const order = require('../../controllers/v1/ordersController')


router.post("/create-order", cors.corsWithOptions, auth.verifyUser, 
auth.verifyRefresh, order.countInStock, paypal.createOrder, async(req, res, next) => 
{
  try{res.json(req.order)}
  catch(err){next(err)}
});

router.post("/capture/:orderID", cors.corsWithOptions, auth.verifyUser, 
auth.verifyRefresh, order.countInStock, async(req, res, next)  => 
{
  try
  {
    const { orderID } = req.params;
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  }catch(err) {next(err)}

});

module.exports = router;
const router = require("express").Router();
const { PAYPAL_SANDBOX_URL, PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
const fetch = require("node-fetch");
const order = require('../../controllers/v1/ordersController')

const Cart = require("../../models/Cart");
// const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product");

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
// const order = require('../../controllers/v1/ordersController')


router.post("/create-order", cors.corsWithOptions, auth.verifyUser, 
auth.verifyRefresh, order.countInStock, async(req, res, next)  => 
{
  try
  {
    const order = await createOrder();
    res.json(order);
  }catch(err) {next(err)}

});

router.post("/capture/:orderID", cors.corsWithOptions, auth.verifyUser, 
auth.verifyRefresh, order.countInStock, async(req, res, next)  => 
{
  try
  {
    const { orderID } = req.params;
    const captureData = await capturePayment(orderID);
    res.json(captureData);
  }catch(err) {next(err)}

});

generateAccessToken = async() =>
{
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString("base64")
  const response = await fetch(`${PAYPAL_SANDBOX_URL}v1/oauth2/token`, 
  {
    method: "post",
    body: "grant_type=client_credentials",
    headers: 
    {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await response.json();
  return data.access_token;
}

createOrder = async() => 
{
  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_SANDBOX_URL}v2/checkout/orders`;
  const response = await fetch(url, 
    {
      method: "post",
      headers: 
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      body: JSON.stringify(
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: "100.00",
              },
            },],
        }),
    });
  const data = await response.json();
  return data;
}

capturePayment = async(orderId) =>
{
  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_SANDBOX_URL}v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, 
    {
      method: "post",
      headers: 
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  const data = await response.json();
  return data;
}

module.exports = router;
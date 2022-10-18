const { PAYPAL_SANDBOX_URL, PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
const Cart = require("../../models/Cart"),
      Product = require("../../models/Product");

const paypal = require('./paypalController'),
      fetch = require('node-fetch'),
      base = PAYPAL_SANDBOX_URL;

exports.generateAccessToken = async() =>
{
  const auth = Buffer.from(PAYPAL_CLIENT_ID 
    + ":" 
    + PAYPAL_APP_SECRET).toString("base64");

  const response = await fetch(`${base}v1/oauth2/token`, 
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

exports.createOrder = async(req, res, next) =>
{
  try
  {
    let {_id, email, customerId} = req.user, userId = _id, userEmail = email;
    const cart = await Cart.findOne({userId : userId});
    
    if(!cart)
    {
      let err = new Error("You have no cart!");
      err.statusCode = 400;
      next(err);
    }

    let purchase_units =  await Promise.all(cart.products.map(
      async(product) => 
      {
        let myProduct =  await Product.findOne({_id : product.productId});
        let name = product.productTitle;
        
        let myProducts = product.productItems.map(productItem =>
          {
            let currency = productItem.price.currency;
            let unitAmountArr = myProduct.productItems.filter
            (
              product => product.load === productItem.load
            );
            let unit_amount = Math.round(unitAmountArr[0].price.value * 100);
            let quantity = productItem.quantity;
            return  {
              amount: 
              {
                currency_code: currency,
                value: unit_amount,
              },
              items: 
              [{
                name : name,
                unit_amount: 
                {
                  value: unit_amount,
                  currency_code: currency
                },
                quantity: quantity
              }]
            }
          })
        return myProducts
      }
    ))
    purchase_units = purchase_units.flat();

    const accessToken = await paypal.generateAccessToken();
    const url = `${base}v2/checkout/orders`;
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
            purchase_units
          }),
      });
    const data = await response.json();
    req.order = data;
    next();
  }catch(err){next(err)}
}

exports.capturePayment = async(orderId) =>
{
  const accessToken = await paypal.generateAccessToken();
  const url = `${base}v2/checkout/orders/${orderId}/capture`;
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

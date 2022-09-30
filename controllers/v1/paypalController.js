const { PAYPAL_SANDBOX_URL, PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

const paypal = require('./paypalController'),
      fetch = require('node-fetch'),
      base = PAYPAL_SANDBOX_URL;

exports.generateAccessToken = async() =>
{
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString("base64")
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

exports.createOrder = async() => 
{
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

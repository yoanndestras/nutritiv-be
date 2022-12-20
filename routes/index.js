const express = require("express");
const limitter = require('express-rate-limit'); // SPAM LIMITTER
const router = express.Router();
const routers = require("./");

exports.users = require(`./v1/user`);
exports.auth = require(`./v1/auth`);
exports.products = require(`./v1/product`);
exports.carts = require(`./v1/cart`);
exports.orders = require(`./v1/order`);
exports.paypal = require(`./v1/paypal`);
exports.stripe = require(`./v1/stripe`);
exports.chats = require(`./v1/chat`);
exports.newsletter = require(`./v1/newsletter`);
exports.dbBackups = require(`./v1/dbBackups`);
// const {uploadRouterV1} = require(`./v1/upload`);

// V1 ROUTES
for (const route in routers) 
{
    const myRoute = routers[route];
    router.use(`/v1/${route}`, myRoute);
}

router.get('/v1/health', (req, res) => 
{
    const data = {
        uptime: process.uptime(),
        message: 'Ok',
        date: new Date()
    }
    
    res.status(200).send(data);
}); // HEALTH CHECK ENDPOINT

const trimmer = (req, res, next) =>
{    
    if(req.method === 'POST' || req.method === 'PUT') 
    {
        for(const [key, value] of Object.entries(req.body)) 
        {
            if(typeof(value) === 'string')
                req.body[key] = value.trim(); // replace blank before and after string
        }
    }
    next();
}; // FUNCTION THAT REMOVE WHITESPACE

router.use(trimmer);

module.exports = router;


////////////////////////////////////////////////

// V2 ROUTER BASE ON URL
// const userRouteV2 = require(`../routes/v2/user`);
// const authRouteV2 = require(`../routes/v2/auth`);
// const productRouteV2 = require(`../routes/v2/product`);
// const cartRouteV2 = require(`../routes/v2/cart`);
// const orderRouteV2 = require(`../routes/v2/order`);
// const {uploadRouterV2} = require(`../routes/v2/upload`);
// const stripeRouteV2 = require(`../routes/v2/stripe`);

// V2 ROUTES
// router.use(`/v2`, router);
// router.use(`/v2/users`, userRouteV2);
// router.use(`/v2/auth`, authRouteV2);
// router.use(`/v2/products`, productRouteV2);
// router.use(`/v2/carts`, cartRouteV2);
// router.use(`/v2/orders`, orderRouteV2);
// router.use(`/v2/imageUpload`, uploadRouterV2);
// router.use(`/v2/stripe`, stripeRouteV2);


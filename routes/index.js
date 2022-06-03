const express = require("express");
const router = express.Router();

// V1 ROUTER BASE ON URL
const userRouteV1 = require(`./v1/user`);
const authRouteV1 = require(`./v1/auth`);
const productRouteV1 = require(`./v1/product`);
const cartRouteV1 = require(`./v1/cart`);
const orderRouteV1 = require(`./v1/order`);
const {uploadRouterV1} = require(`./v1/upload`);
const stripeRouteV1 = require(`./v1/stripe`);
const chatRouteV1 = require(`./v1/chat`);
const newsletterRouteV1 = require(`./v1/newsletter`);
const dbBackupsV1 = require(`./v1/dbBackups`);

// V1 ROUTES
router.use(`/v1`, router);
router.use(`/v1/users`, userRouteV1);
router.use(`/v1/auth`, authRouteV1);
router.use(`/v1/products`, productRouteV1);
router.use(`/v1/carts`, cartRouteV1);
router.use(`/v1/orders`, orderRouteV1);
router.use(`/v1/imageUpload`, uploadRouterV1);
router.use(`/v1/stripe`, stripeRouteV1);
router.use(`/v1/chats`, chatRouteV1);
router.use(`/v1/newsletter`, newsletterRouteV1);
router.use(`/v1/dbBackups`, dbBackupsV1);

router.get('/health', (req, res) => 
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
                req.body[key] = value.trim();
        }
    }
    next();
} // FUNCTION THAT REMOVE WHITESPACE

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


const express = require("express");
const router = express.Router();

// V1 ROUTER BASE ON URL
const userRouteV1 = require(`../routes/v1/user`);
const authRouteV1 = require(`../routes/v1/auth`);
const productRouteV1 = require(`../routes/v1/product`);
const cartRouteV1 = require(`../routes/v1/cart`);
const orderRouteV1 = require(`../routes/v1/order`);
const {uploadRouterV1} = require(`../routes/v1/upload`);
const stripeRouteV1 = require(`../routes/v1/stripe`);
const chatRouteV1 = require(`../routes/v1/chat`);

// V2 ROUTER BASE ON URL
const userRouteV2 = require(`../routes/v2/user`);
const authRouteV2 = require(`../routes/v2/auth`);
const productRouteV2 = require(`../routes/v2/product`);
const cartRouteV2 = require(`../routes/v2/cart`);
const orderRouteV2 = require(`../routes/v2/order`);
const {uploadRouterV2} = require(`../routes/v2/upload`);
const stripeRouteV2 = require(`../routes/v2/stripe`);

////////////////////////////////////////////////////////

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

// V2 ROUTES
router.use(`/v2`, router);
router.use(`/v2/users`, userRouteV2);
router.use(`/v2/auth`, authRouteV2);
router.use(`/v2/products`, productRouteV2);
router.use(`/v2/carts`, cartRouteV2);
router.use(`/v2/orders`, orderRouteV2);
router.use(`/v2/imageUpload`, uploadRouterV2);
router.use(`/v2/stripe`, stripeRouteV2);

module.exports = router;
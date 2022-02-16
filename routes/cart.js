const Cart = require("../models/Cart");
const router = require("express").Router();
const mongoose = require('mongoose');

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');
const product = require('../controllers/product');
const cart = require('../controllers/cart');
const {upload} = require('./upload');

//OPTIONS FOR CORS
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE CART // cart.cart,
router.post("/addToCart", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, upload.any('imageFile'), 
product.verifyStock, product.verifyProduct, cart.cart, async(req, res) =>
{
    try
    {
        let cart = await Cart.findOne({userId : req.user._id});
        await cart.save();

        if(req.new === true) 
        {
            res.status(200).json(
                {
                    success: true,
                    status: "Cart successfully added",
                    newCart: await Cart.findOne({userId : req.user._id})
                }
            );            
        }
        else
        {
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated, product successfully added",
                    updatedCart: await Cart.findOne({userId : req.user._id})
                }
            ); 
        }
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
                err: err.message
            }
        );
    }
})

// ADD QUANTITY PRODUCT IN CART 
router.put("/updateQuantity/:id/:load/:operation", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
product.verifyPricePerProduct, cart.updateQuantity, async(req, res) =>
{
    try
    {
        let cart = await Cart.findOne({userId : req.user._id});
        await cart.save();

        res.status(200).json(
            {
                success: true,
                status: "Cart succesfully updated",
                updatedCart: await Cart.findOne({userId : req.user._id})
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
})

// DELETE PRODUCT IN CART
router.delete("/:userId/:productId/:load", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, cart.deleteProductInCart, async (req, res) =>
{
    try
    {
        let cart = await Cart.findOne({userId : req.user._id});
        await cart.save();

        res.status(200).json(
            {
                success: true,
                status: "Cart succesfully updated",
                updatedCart: await Cart.findOne({userId : userId})
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

})

// DELETE CART
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json(
            {
                success: true,
                status: "Cart has been deleted...",
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
                err: err
            });
    }

})

// GET USER CART
router.get("/find/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        const cart = await Cart.findOne({userId: req.params.userId})
        res.status(200).json(
            {
                success: true,
                status: "User cart found",
                cart: cart
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
                err: err
            });
    }
})

// GET ALL 
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
{
    try
    {
        const carts = await Cart.find();
        res.status(200).json(
            {
                success: true,
                status: "All carts found",
                carts: carts
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
                err: err
            });
    }
})

module.exports = router;
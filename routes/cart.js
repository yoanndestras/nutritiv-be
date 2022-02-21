const Cart = require("../models/Cart");
const router = require("express").Router();
const mongoose = require('mongoose');

// MIDDLEWARES
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');
const product = require('../controllers/productsController');
const cart = require('../controllers/cartController');
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
        if(req.new === true) 
        {
            await cart.save();
            res.status(200).json(
                {
                    success: true,
                    status: "Cart successfully added",
                    cart: cart
                }
            );
        }
        else
        {
            await cart.save();
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated, product successfully added",
                    cart: cart
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
                cart: cart
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
        if(cart)
        {
            await cart.save();
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated",
                    cart: cart
                });
        }
        else
        {
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated & deleted!"
                });
        }
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
router.get("/self", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async (req, res) =>
{
    try
    {
        const cart = await Cart.findOne({userId: req.user._id})
        
        if(cart)
        {
            await cart.save();
            res.status(200).json(
                {
                    success: true,
                    status: "User cart found",
                    cart: cart
                });
        }
        else if(!cart)
        {
            res.status(200).json(
                {
                    success: true,
                    status: "Cart do not exist!"
                });
        }
        
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
        await carts.save();
        
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
const Cart = require("../../models/Cart");
const router = require("express").Router();
const mongoose = require('mongoose');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const product = require('../../controllers/v1/productsController');
const cart = require('../../controllers/v1/cartController');
const {upload} = require('./upload');

//OPTIONS FOR CORS
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// GET USER CART
router.get("/self", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async (req, res, next) =>
{
    try
    {
        const cart = await Cart.findOne({userId: req.user._id}).lean();
        
        if(cart)
        {
            res.status(200).json(
                {
                    success: true,
                    status: "User cart found",
                    cart
                });
        }
        else if(!cart)
        {
            res.status(200).json(
                {
                    success: true,
                    status: "No cart has been found for user "+ req.user.username +"!"
                });
        }
    }catch(err){next(err)}
})

// GET ALL 
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res, next) =>
{
    try
    {
        const carts = await Cart.find().lean();
        
        if(!carts.length)
        {
            res.status(200).json(
                {
                    success: true,
                    status: "No carts has been found!"
                });
        }
        else if(carts)
        {
            res.status(200).json(
                {
                    success: true,
                    carts
                });
        }
    }catch(err){next(err)}
})

// CREATE CART // cart.cart,
router.post("/addToCart", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, upload.any('imageFile'), 
product.verifyStock, product.verifyProduct, cart.cart, async(req, res, next) =>
{
    try
    {
        let cart = await Cart.findOne({userId : req.user._id});
        if(req.new === true) 
        {
            await cart.save();
            res.status(201).json(
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
            res.status(201).json(
                {
                    success: true,
                    status: "Cart succesfully updated, product successfully added",
                    cart: cart
                }
            ); 
        }
    }catch(err){next(err)}
})

// ADD QUANTITY PRODUCT IN CART 
router.put("/updateQuantity/:productId/:load/:operation", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
product.verifyPricePerProduct, cart.updateQuantity, async(req, res, next) =>
{
    try
    {
        let cart = await Cart.findOne({userId : req.user._id});
        await cart.save();

        res.status(201).json(
            {
                success: true,
                status: "Cart succesfully updated",
                cart: cart
            });
    }catch(err){next(err)}
})

// DELETE PRODUCT IN CART
router.delete("/:userId/:productId/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, cart.deleteProductInCartById, async (req, res, next) =>
{
    try
    {
        let cart = await Cart.findOne({userId : req.user._id});
        if(cart)
        {
            await cart.save();
            res.status(201).json(
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
                    status: "Cart succesfully deleted!"
                });
        }
    }catch(err){next(err)}
})

// DELETE CART
router.delete("/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, 
async (req, res, next) =>
{
    try
    {
        await Cart.findOne({userId: req.params.userId})
        res.status(200).json(
            {
                success: true,
                status: "Cart has been deleted...",
            });
    }catch(err){next(err)}

})

module.exports = router;



// // DELETE PRODUCT IN CART
// router.delete("/:userId/:productId/:load", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// auth.verifyAuthorization, cart.deleteProductInCart, async (req, res) =>
// {
//     try
//     {
//         let cart = await Cart.findOne({userId : req.user._id});
//         if(cart)
//         {
//             await cart.save();
//             res.status(200).json(
//                 {
//                     success: true,
//                     status: "Cart succesfully updated",
//                     cart: cart
//                 });
//         }
//         else
//         {
//             res.status(200).json(
//                 {
//                     success: true,
//                     status: "Cart succesfully deleted!"
//                 });
//         }
//     }
//     catch(err)
//     {
//         res.status(500).json(
//             {
//                 success: false,
//                 status: "Unsuccessfull request!",
//                 err: err.message
//             });
//     }

// })



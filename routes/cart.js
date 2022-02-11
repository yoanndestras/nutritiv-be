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

// CREATE CART
router.post("/addToCart", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, upload.any('imageFile'), 
product.verifyProduct, cart.cart, async (req, res) =>
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

// ADD QUANTITY PRODUCT CART 
router.put("/updateQuantity/:id/:load/:operation", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, product.verifyPricePerProduct, async(req, res) =>
{
    try
    {
        const userId = req.user._id;
        const Id = req.params.id;
        const Load = parseFloat(req.params.load);
        const Price = parseFloat(req.price);
        
        const quantity = req.params.operation === "inc" ? 1 : req.params.operation === "dec" ? -1 : null;
        const value = req.params.operation === "inc" ? Price : req.params.operation === "dec" ? - Price : null;
        
        if(quantity && value)
        {
                await Cart.findOneAndUpdate(
                {userId : userId}, 
                {
                    $inc: {
                        "products.$[outer].productItems.$[inner].quantity": quantity,
                        "products.$[outer].productItems.$[inner].price.value": value,
                        "amount.value": value
                    }
                },
                {
                    arrayFilters: [
                    {
                        'outer.productId': mongoose.Types.ObjectId(Id)
                    },
                    {
                        'inner.load': Load
                    }],
                    new: true
                },
            );

            let cart = await Cart.aggregate([
                { $match : {"userId" : userId} },
                {
                    $project : {
                        roundedValue:  
                        {
                            $round : ["$amount.value", 2]
                        }
                    }
                }
            ])

            await Cart.findOneAndUpdate(
                {"userId": userId},
                {
                    $set: {
                        "amount.value": cart[0].roundedValue
                    }
                }
            )
        }
        else
        {
            res.status(500).json(
                {
                    success: false,
                    status: "This operation do not exist!"
                });
        }

        let updatedCart = await Cart.findOne({userId : userId});
        let total = updatedCart ? await updatedCart.amount.value <=  0 : null;
        if(total)
        {
            await Cart.deleteOne({userId : userId})
        } 
        
        const productsArray = updatedCart ? updatedCart.products : null; 
        const productIndex =  productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
        let product = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id) : null;
        product = product && product.length === 1 ? product[0].productItems.map(el => el.quantity === 0) : null
        
        updatedCart = product[0] === true ? await Cart.findOneAndUpdate(
            {userId : userId}, 
            {
                $pull: 
                {
                    "products.$[outer].productItems": {load : Load} ,
                }
            },
            {
                arrayFilters: [
                {
                    'outer.productId': mongoose.Types.ObjectId(Id)
                }],
                new: true
            },
        ): null;
        
        product = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id) : null;
        
        updatedCart = product[0].productItems && product[0].productItems[0].quantity === 0 ? await Cart.findOneAndUpdate(
            {userId : userId}, 
            {
                $pull: 
                {
                    "products": {productId : mongoose.Types.ObjectId(Id)}
                }
            }
        ): null;

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

// DELETE PRODUCT IN CART
router.delete("/:userId/:productId/:load", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        const userId = req.params.userId;
        const productId = req.params.productId;
        const Load = parseFloat(req.params.load);
        
        const existingCart = await Cart.findOne({userId : userId});
        const productsArray = existingCart ? existingCart.products : null;
        const productIndex =  productsArray ? productsArray.findIndex(el => el.productId.toString() === productId) : null;
        const product = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === productId && el.productItems.find(el => el.load === Load)) : null;
        
        const amount = product && product.length > 0 ? product[0].productItems[0].price.value : null;

        if(amount)
        {
            await Cart.findOneAndUpdate(
                {userId : userId},
                {
                    $pull: 
                        {
                            "products.$[outer].productItems" : {load : Load} 
                        },
                },
                {
                    arrayFilters: [
                    {
                        'outer.productId': mongoose.Types.ObjectId(productId)
                    }
                    ]
                },
            );

            await Cart.findOneAndUpdate(
                {userId : userId},
                {
                    $inc: 
                    {
                        "amount.value": - amount
                    }
                }
            );

            const updatedCart = await Cart.findOne({userId : userId});
            let total = updatedCart ? await updatedCart.amount.value ===  0 : null;
            if(total){await Cart.deleteOne({userId : userId})}
            
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated",
                    updatedCart: await Cart.findOne({userId : userId})
                });
        }
        else
        {
            res.status(500).json(
                {
                    success: false,
                    status: "Unsuccessfull request!",
                    err: "Product not found"
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
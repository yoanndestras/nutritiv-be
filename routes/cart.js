const Cart = require("../models/Cart");
const Product = require("../models/Product")
const router = require("express").Router();
const mongoose = require('mongoose');

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');
const check = require('../controllers/product');
const {upload} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE CART
router.post("/addToCart", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, upload.any('imageFile'), check.verifyProduct, async (req, res) =>
{
    try
    {
        const userId = req.user._id;
        const Id = req.body.productId;
        const Quantity = parseFloat(req.body.quantity);
        const Load = parseFloat(req.body.val);
        const Price = parseFloat(req.body.price);
        
        const existingCart = await Cart.findOne({userId : userId});
        
        const productsArray = existingCart ? existingCart.products : null;
        const productIndex = productsArray ? productsArray.findIndex(el => el.productId === Id) : null;
        const newProduct = productIndex ? productsArray.filter(el => el.productId === Id && el.productItems.some(el => el.load === Load)) : null;
        console.log(newProduct);
        
            if(newProduct)
            {
                let currentProductQuantity = newProductLoad.quantity + newProductQuantity;
                let currentProductPrice = newProductLoad.price + newProductPrice;
                let currentProductVal = newProductLoad.val;
                
                updatedCart = await Cart.findOneAndUpdate(
                    {"userId": userId},
                    {
                        $set: {
                            "products.$[outer].load.$[inner].quantity": currentProductQuantity,
                            "products.$[outer].load.$[inner].price": currentProductPrice,
                        }
                    },
                    {
                        arrayFilters: [
                        {
                            'outer.productId': newProductId
                        },
                        {
                            'inner.val': currentProductVal
                        }],
                        new: true
                    },
                )

                res.status(400).json(
                    {
                        success: false,
                        status: "Unsuccessfull request!",
                    });
            }
            else if(existingCart)
            {
                
                updatedCart = await Cart.findOneAndUpdate(
                    {"userId" : userId}, 
                    {
                        $push : 
                        {
                            products : 
                            {
                                productId : newProductId,
                                load: [
                                    {
                                        val: newProductVal,
                                        price: newProductPrice,
                                        quantity: newProductQuantity
                                    }
                                ]
                            }
                        }
                    }) 
            }
            else
            {
                load =  [
                            {
                                val : parseFloat(newProductVal), 
                                price : parseFloat(newProductPrice),
                                quantity : parseFloat(newProductQuantity)
                            }
                        ]
                let newProduct = {productId : newProductId, load: load};
                const newCart = new Cart(
                    {
                        userId: userId,
                        products: newProduct
                    }
                );
                await newCart.save();
                res.status(200).json(
                    {
                        success: true,
                        status: "Cart successfully added",
                        newCart: newCart
                    });
            }
            
            if(updatedCart)
            {
                await updatedCart.save()
                res.status(200).json(
                    {
                        success: true,
                        status: "Cart succesfully updated, product successfully added",
                        updatedCart: await Cart.findOne({userId : userId})
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

// UPDATE CART
router.put("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async(req, res) =>
{
    try
    {
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id, 
            {
                $set: req.body
            },
            {new: true});
        
        res.status(200).json(
            {
                success: true,
                status: "Cart succesfully updated",
                updatedCart: updatedCart
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
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
        const Load = parseFloat(req.body.load);
        const Price = parseFloat(req.body.price);
        
        let price = parseFloat((Price * Quantity).toFixed(2))

        const existingCart = await Cart.findOne({userId : userId});
        const productsArray = existingCart ? existingCart.products : null;
        const productIndex = productsArray ? productsArray.findIndex(el => el.productId === Id) : null;
        
        const newProduct = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId === Id && el.productItems.some(el => el.load === Load)) : null;
        
        if(newProduct && newProduct.length > 0) 
        {
            updatedCart = await Cart.findOneAndUpdate(
                {"userId": userId},
                {
                    $inc: {
                        "products.$[outer].productItems.$[inner].quantity": Quantity,
                        "products.$[outer].productItems.$[inner].price.value": price,
                        "amount.value": price
                    }
                },
                {
                    arrayFilters: [
                    {
                        'outer.productId': Id
                    },
                    {
                        'inner.load': Load
                    }],
                    new: true
                },
            )
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated, product successfully added",
                    updatedCart: await Cart.findOne({userId : userId})
                });             
            }
        else if( productIndex !== null)
        {
            let productItems =  
                {
                    id: mongoose.Types.ObjectId(),
                    load : Load, 
                    quantity : Quantity,
                    price : 
                    {
                        value : price,
                        currency : "EUR"
                    },
                }
            
            updatedCart = await Cart.findOneAndUpdate(
                {"userId" : userId, "productId": Id}, 
                {
                    $push: {
                        "products.$[].productItems": productItems,
                    },
                    $inc: {
                        "amount.value": price
                    }
                }
                
            )
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated, product successfully added",
                    updatedCart: await Cart.findOne({userId : userId})
                }); 
        }
        else if(existingCart)
        {
            let productItems =  [
                        {
                            id: mongoose.Types.ObjectId(),
                            load : Load, 
                            quantity : Quantity,
                            price : 
                                {
                                    value : price,
                                    currency : "EUR"
                                }
                        }
                    ]
            
            let newProduct = {productId : Id, productItems: productItems};
            
            updatedCart = await Cart.findOneAndUpdate(
                {"userId" : userId}, 
                {
                    $push: {
                        products: newProduct
                    },
                    $inc: {
                        "amount.value": price
                    }
                }
            )
            res.status(200).json(
                {
                    success: true,
                    status: "Cart succesfully updated, product successfully added",
                    updatedCart: await Cart.findOne({userId : userId})
                }); 
        }
        else
        {
            const newCart = new Cart(
                {
                    userId: userId,
                    products: 
                    {
                        productId : Id, 
                        productItems: 
                        [
                            {
                                id: mongoose.Types.ObjectId(),
                                load : Load,
                                quantity : Quantity,
                                price : 
                                {
                                    value : price,
                                    currency : "EUR"
                                }
                            }
                        ]
                    },
                    "amount.value" : price
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

// ADD QUANTITY PRODUCT CART
router.put("/addQuantity/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res) =>
{
    try
    {
        const userId = req.user._id;
        const Id = req.body.productId;

        const existingProduct = await Product.findById(req.params.id);

        const updatedCart = await Cart.findOne({
            userId : userId}, 
            {
                $inc: {
                    "products.$[outer].productItems.$[inner].quantity": 1,
                    "products.$[outer].productItems.$[inner].price": incPrice,
                }
            },
            {
                arrayFilters: [
                {
                    'outer.productId': Id
                },
                {
                    'inner.load': Load
                }],
                new: true
            },
        )
        
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
        const updatedCart = await Cart.findOne({
            userId : userId}, 
            {
                $set: req.body
            },
            {new: true});

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
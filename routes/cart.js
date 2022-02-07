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
        const productIndex = productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
        
        const newProduct = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id && el.productItems.some(el => el.load === Load)) : null;

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
                        'outer.productId': mongoose.Types.ObjectId(Id)
                    },
                    {
                        'inner.load': Load
                    }],
                    multi: true
                },
            )
            
            let cart = await Cart.aggregate([
                { $match : {"userId" : userId.toString()} },
                {
                    $project : {
                        roundedValue:  
                        {
                            $round : ["$amount.value", 2]
                        }
                    }
                }
            ])

            updatedCart = await Cart.findOneAndUpdate(
                {"userId": userId},
                {
                    $set: {
                        "amount.value": cart[0].roundedValue
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

        else if( productIndex !== null && productIndex !== -1)
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
                {"userId" : userId, "productId": mongoose.Types.ObjectId(Id)}, 
                {
                    $push: {
                        "products.$[].productItems": productItems,
                    },
                    $inc: {
                        "amount.value": price
                    }
                })

                let cart = await Cart.aggregate([
                    { $match : {"userId" : userId.toString()} },
                    {
                        $project : {
                            roundedValue:  
                            {
                                $round : ["$amount.value", 2]
                            }
                        }
                    }
                ])
    
                updatedCart = await Cart.findOneAndUpdate(
                    {"userId": userId},
                    {
                        $set: {
                            "amount.value": cart[0].roundedValue
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
            
            let newProduct = {productId : mongoose.Types.ObjectId(Id), productItems: productItems};
            
            updatedCart = await Cart.findOneAndUpdate(
                {"userId" : userId}, 
                {
                    $push: 
                    {
                        products: newProduct
                    },
                    $inc: 
                    {
                        "amount.value": price
                    }
                }
            )

            let cart = await Cart.aggregate([
                { $match : {"userId" : userId.toString()} },
                {
                    $project : {
                        roundedValue:  
                        {
                            $round : ["$amount.value", 2]
                        }
                    }
                }
            ])

            updatedCart = await Cart.findOneAndUpdate(
                {"userId": userId},
                {
                    $set: {
                        "amount.value": cart[0].roundedValue
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
                        productId : mongoose.Types.ObjectId(Id), 
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
                    "amount.value" : price,
                    "amount.roundedValue": price
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
router.put("/updateQuantity/:id/:load/:operation", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, check.verifyPricePerProduct, async(req, res) =>
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
                { $match : {"userId" : userId.toString()} },
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
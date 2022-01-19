const Cart = require("../models/Cart");
const Product = require("../models/Product")
const router = require("express").Router();
const mongoose = require('mongoose');

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE CART
router.post("/addToCart", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async (req, res) =>
{
    try
    {
        let updatedCart;
        const userId = req.user._id;
        const newProductId = req.body.product.productId;
        const newProductQuantity = req.body.product.quantity;
        const load = req.body.product.load;
        
        let verifyProductId = new mongoose.Types.ObjectId.createFromHexString(newProductId); 
        const existingProductId = await Product.findById(verifyProductId);
        
        const existingCart = await Cart.findOne({userId : userId});
        const newProductArray = existingCart ? existingCart.products : null;
        const newProductIndex = newProductArray ? newProductArray.findIndex(el => el.productId === newProductId) : null;
        console.log(await Object.keys(newProductArray.load));
        let keys =  newProductArray ? Object.keys(newProductArray.load) : null, values = newProductArray ? Object.values(newProductArray.load) : null;
        const existingLoad = newProductArray ?  newProductArray.findIndex(el => Object.keys(el.load) === keys && Object.values(el.load) === values) : null;
        
        if(existingProductId)
        {
            if(newProductIndex !== null && newProductIndex !== -1 && existingLoad !== null && existingLoad !== -1)
            {
                let currentProductQuantity = newProductArray[newProductIndex].quantity;
                currentProductQuantity = currentProductQuantity + newProductQuantity;
                
                updatedCart = await Cart.findOneAndUpdate({userId : userId, "products.productId": newProductId}, { $set : {"products.$.quantity": currentProductQuantity}})
            }
            else if(existingCart)
            {
                updatedCart = await Cart.findOneAndUpdate({userId : userId}, {$push : {products : req.body.product}}) 
            }
            else
            {
                
                let newProduct = {productId : newProductId, quantity : newProductQuantity, load: load};
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
            
            if(updatedCart !== null && updatedCart !== undefined)
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
        else
        {
            res.status(400).json(
                {
                    success: false,
                    status: "Unsuccessfull request!",
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
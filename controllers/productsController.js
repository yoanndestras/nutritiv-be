const express = require('express');
const Product = require("../models/Product");
const check = require('./productsController');
const Cart = require("../models/Cart");

const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));


exports.newProduct = async(req, res, next) =>
{
    let product;
    let shape = req.body.shape;
    const files = req.files;
    
    const req_tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags !== undefined ? [req.body.tags] : null;
    const load = Array.isArray(req.body.load) ? req.body.load : req.body.load !== undefined ? [req.body.load] : null;
    let imgs = files.map((el, i) => {return path.join(el.destination,'resized', el.filename)}), tags = req_tags.map((el, i) => {return el});    

    const PPCapsule = req.body.pricePerCapsule;
    const PPKg = req.body.pricePerKilograms;

    if(shape === "capsules" && PPCapsule)
    {
        let milestones = {30: 0.1, 60: 0.2, 120: 0.4, 210: 0.5};
        let keys = Object.keys(milestones), values = Object.values(milestones);
        
        product = load.map((el, i) => {
            price = el * parseFloat(PPCapsule);
            let discountValues = check.discount(values, price, el, keys);
            return {load : discountValues.qty, price :{ value : discountValues.price, currency : "EUR"}}
        })
    }
    else if(shape === "powder" && PPKg)
    {
        let milestones = { 60: 0, 150: 0.2, 350: 0.4, 1000: 0.5};
        let keys = Object.keys(milestones), values = Object.values(milestones);
        
        product = load.map((el, i) => {
            price = el * (parseFloat(PPKg)/1000);
            let discountValues = check.discount(values, price, el, keys);
            return {load : discountValues.qty, price :{ value : discountValues.price, currency : "EUR"}}
        })
    }
    else
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
            });
    }

    req.product = product;
    req.tags = tags;
    req.imgs = imgs;

    next();
}

exports.discount = (values, price, el, keys) => {
    
    const output = keys.reduce((prev, curr) => Math.abs(curr - el) < Math.abs(prev - el) ? curr : prev);
    let Index = keys.indexOf(output);
    
    let discountedPrice = price - price * (values[Index]);
    price = Math.round(discountedPrice) - 0.01;
    qty = parseFloat(el), price = parseFloat(price);
    
    return {qty, price}
}

exports.verifyProduct = async(req, res, next) => {
    
    const newProductId = req.body.productId;
    const newProductLoad = parseFloat(req.body.load);
    const newProductPrice = parseFloat(req.body.price);
    
    const existingProduct = await Product.findById(newProductId);

    let productId = existingProduct ? existingProduct._id : null;
    let productArray = productId ? existingProduct.productItems : null;
    
    let productLoadAndPrice = productArray ? productArray.map((el, i) => {if(el.load === newProductLoad && el.price.value === newProductPrice) {return el.load}}) : null;
    let productQuantityInStock = existingProduct ? existingProduct.countInStock >= newProductLoad ? true : false : null;
    productLoadAndPrice = productLoadAndPrice ? productLoadAndPrice.filter(el => el !== undefined) : null;
        
    if(Array.isArray(productLoadAndPrice) && productLoadAndPrice[0] && productId && productQuantityInStock)
    {
        next();
    }
    else if(productQuantityInStock === false)
    {
        let err = new Error("Not enough quantity in stock for this new product");
        err.status = 403;
        return next(err);
    }
    else
    {
        let err = new Error('Id : ' + newProductId + ', Val : ' + newProductLoad + ", Price : " + newProductPrice + " doesnt exist");
        err.status = 403;
        return next(err);
    }
}

exports.verifyPricePerProduct = async(req, res, next) => {
    
    const newProductId = req.params.id;
    const newProductLoad = parseFloat(req.params.load);
    
    const existingProduct = await Product.findById(newProductId);
    let productId = existingProduct ? existingProduct._id : null;
    let productArray = productId ? existingProduct.productItems : null;

    let productPrice = productArray ? productArray.map((el, i) => {if(el.load === newProductLoad) {return el.price.value}}) : null;
    let productQuantityInStock = existingProduct ? existingProduct.countInStock >= newProductLoad ? true : false : null;
    productPrice = productPrice ? productPrice.filter(el => el !== undefined) : null;
    
    
    if(Array.isArray(productPrice) && productPrice[0] && productId && productQuantityInStock) 
    {
        req.price = productPrice
        next();
    }
    else if(productQuantityInStock === false)
    {
        let err = new Error("Not enough quantity in stock for this new product");
        err.status = 403;
        return next(err);
    }
    else
    {
        let err = new Error('Id : ' + newProductId + ' Val : ' + newProductLoad + " doesnt exist");
        err.status = 403;
        return next(err);
    }
}

exports.verifyStock = async(req, res, next) => {

    const productLoad = parseFloat(req.body.load);
    const productQuantity = parseInt(req.body.quantity)
    const productId = req.body.productId;
    const userId = req.user.id;
    
    const cart = await Cart.findOne({userId : userId});
    let findProductId = cart ? cart.products.find(el => el.productId.toString() === productId) : null;

    if(findProductId)
    {
        let load = findProductId.productItems.map((productItems) => {return productItems.load;});
        let qty = findProductId.productItems.map((productItems) => {return productItems.quantity;});

        let sumWithInitial;
        let err;
        let emptyTable = []
        
        for (let i = 0; i < load.length; i++) 
        {
            let initialValue = 0;
            
            emptyTable.push(load[i] * qty[i])
            sumWithInitial = emptyTable.reduce(
            (previousValue, currentValue) => previousValue + currentValue,
            initialValue
            );            
            
            let cartProduct = await Product.findOne({_id: productId});
            let stockAvailable = cartProduct.countInStock;

            if(stockAvailable - (sumWithInitial + productLoad * productQuantity) <= 0)
            {
                err = new Error('The stock for this product is not available : ' + cartProduct.title);
                err.status = 400;
            }
        }
        if(err)
        {
            next(err);
        }
        else
        {
            next();
        }
    
    }
    else
    {
        next();
    }
}

exports.verifyProductId = async(req, res, next) =>
{
    const productId = req.params.id;

    if(ObjectId.isValid(productId))
    {
        const product = await Product.findOne({_id :productId});
        if(product)
        {
            next()
        }
        else
        {
            let err = new Error('This product do not exist : ' + productId);
            err.status = 400;
            next(err);
        }
    }
    else
    {
        let err = new Error('The productId is not an ObjectId : ' + productId);
        err.status = 400;
        next(err);
    }
    
    
}

exports.removeImgs = async(req, res, next) =>
{
    const removeFile= function (err) 
    {
        if (err) 
        {
            console.log("unlink failed", err);
            next(err)
        } 
        else 
        {
            console.log("file deleted");
        }
    }
    
    const product = await Product.findOne({_id : req.params.id})
    let productImg = product.imgs;
    let unlickImg = productImg ? productImg.map(img => fs.unlink('public/' + img, removeFile)) : null;
    
    next();
}

exports.countInStock = async(req, res, next) =>
{
    const userId = req.user._id;
    const productId = req.params.id;
    const cart = await Cart.findOne({userId : userId});
    let findProductId = cart ? cart.products.find(el => el.productId.toString() === productId) : null;
    
    if(findProductId)
    {
        let load = findProductId.productItems.map((productItems) => {return productItems.load;});
        let qty = findProductId.productItems.map((productItems) => {return productItems.quantity;});
        
        let sumWithInitial;
        let emptyTable = []
        
        for (let i = 0; i < load.length; i++) 
        {
            let initialValue = 0;
            
            emptyTable.push(load[i] * qty[i])
            sumWithInitial = emptyTable.reduce(
            (previousValue, currentValue) => previousValue + currentValue,
            initialValue
            );            
            
            let cartProduct = await Product.findOne({_id: productId});
            let stockAvailable = cartProduct.countInStock;
            const stockCalculated = stockAvailable - sumWithInitial;
            req.stock = stockCalculated;
        }
        
        next();
    }
    else if(productId)
    {
        const product = await Product.findOne({_id: productId});
        const stockAvailable = product.countInStock;
        req.stock = stockAvailable;
        next();
    }
    
}

// RESIZE IMG
exports.resizeProductImage = async(req, res, next) => 
{
    if (!req.files) return next();
    await Promise.all
    (
        req.files.map(async file => 
            {
            await sharp(file.path)
                .resize(200, 200)
                .toFile(
                    path.resolve(file.destination,'productsImgs', file.filename)
                )
                fs.unlinkSync(file.path) 
            })
    );
    
    next();

};

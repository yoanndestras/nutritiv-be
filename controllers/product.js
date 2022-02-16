const express = require('express');
const Product = require("../models/Product");
const check = require('./product');
const Cart = require("../models/Cart");
const mongoose = require('mongoose');


const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));


exports.newProduct = async(req, res, next) =>
{
    let product;
    let shape = req.body.shape;
    const files = req.files
    const req_tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags !== undefined ? [req.body.tags] : null;
    const load = Array.isArray(req.body.load) ? req.body.load : req.body.load !== undefined ? [req.body.load] : null;
    let imgs = files.map((el, i) => {return el.path}), tags = req_tags.map((el, i) => {return el});    
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
        let load = findProductId.productItems.map(productItems => Object.values(productItems)[1]); // 1 = load
        let qty = findProductId.productItems.map(productItems => Object.values(productItems)[2]); // 2 = quantity
        

        let sumWithInitial;
        let err;
        let emptyTable = []
        
        for (let i = 0; i < load.length; i++) 
        {
            let initialValue = 0;
            console.log(emptyTable);
            
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

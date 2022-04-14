const express = require('express');
const Product = require("../../models/Product");
const check = require('./productsController');
const Cart = require("../../models/Cart");

const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// CONTROLLERS
const fileUpload = require('../../controllers/v1/fileUploadController');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

exports.newProduct = async(req, res, next) =>
{
    try
    {

        const {shape, tags, load, pricePerCapsule, pricePerKilograms} = req.body
        const PPCapsule = pricePerCapsule, PPKg = pricePerKilograms;
        let product;
        
        const req_tags = tags && Array.isArray(tags) ? tags : tags !== undefined ? [tags] : null;
        const loadArr = load && Array.isArray(load) ? load : load !== undefined ? [load] : null;
        let tagsArr = req_tags ? req_tags.map((el, i) => {return el}) : null;    
        
        if(shape === "capsules" && PPCapsule)
        {
            let milestones = {30: 0.1, 60: 0.2, 120: 0.4, 210: 0.5}, keys = Object.keys(milestones), values = Object.values(milestones);
            product = loadArr.map((el, i) => {
                price = el * parseFloat(PPCapsule);let discountValues = check.discount(values, price, el, keys);
                return {load : discountValues.qty, price :{ value : discountValues.price, currency : "EUR"}}
            })
        }
        else if(shape === "powder" && PPKg)
        {
            let milestones = { 60: 0, 150: 0.2, 350: 0.4, 1000: 0.5}, keys = Object.keys(milestones), values = Object.values(milestones);
            product = loadArr.map((el, i) => {
                price = el * (parseFloat(PPKg)/1000);let discountValues = check.discount(values, price, el, keys);
                return {load : discountValues.qty, price :{ value : discountValues.price, currency : "EUR"}}
            })
        }
        else
        {
            let err = new Error("Missing or wrong elements");
            err.statusCode = 400;
            return next(err);
        }
        
        if(!req.params.productId)
        {
            const { title, desc, countInStock } = req.body;
            req.title = title;
    
            const newProduct = await new Product(
                {
                    title,
                    desc,
                    shape,
                    tags : tagsArr,
                    productItems: product,
                    countInStock
                },
                {new: true}
            );
            await newProduct.save();
        }
        

        next();
    }catch(err){next(err)}
}

exports.discount = (values, price, el, keys) => 
{
    try
    {

        const output = keys.reduce((prev, curr) => Math.abs(curr - el) < Math.abs(prev - el) ? curr : prev);
        let Index = keys.indexOf(output), discountedPrice = price - price * (values[Index]);
        price = Math.round(discountedPrice) - 0.01;
        qty = parseFloat(el), price = parseFloat(price);
        
        return {qty, price}
    }catch(err){next(err)}
}

exports.verifyProduct = async(req, res, next) => 
{
    try
    {
        const {load, price} = req.body;
        const newProductId = req.body.productId, newProductLoad = parseFloat(load), newProductPrice = parseFloat(price);

        const existingProduct = await Product.findById(newProductId);
        let productArray = existingProduct?.productItems;

        let productLoadAndPrice = productArray ? productArray.map((el) => {if(el.load === newProductLoad && el.price.value === newProductPrice) {return el.load}}) : null;
        let productQuantityInStock = existingProduct ? existingProduct.countInStock >= newProductLoad ? true : false : null;
        productLoadAndPrice = productLoadAndPrice ? productLoadAndPrice.filter(el => el !== undefined) : null;

        if(Array.isArray(productLoadAndPrice) && productLoadAndPrice[0] && newProductId && productQuantityInStock){next();}
        else if(productQuantityInStock === false)
        {
            let err = new Error("Not enough quantity in stock for this product");
            err.statusCode = 403;
            return next(err);
        }
        else
        {
            let err = new Error('Id : ' + newProductId + ', Val : ' + newProductLoad + ", Price : " + newProductPrice + " doesnt exist");
            err.statusCode = 400;
            return next(err);
        }
    }catch(err){next(err)}
}

exports.verifyPricePerProduct = async(req, res, next) => 
{
    try
    {
        const newProductId = req.params.id, newProductLoad = parseFloat(req.params.load);
    
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
            let err = new Error("Not enough quantity in stock for this product");
            err.statusCode = 400;
            return next(err);
        }
        else
        {
            let err = new Error('Id : ' + newProductId + ' Val : ' + newProductLoad + " doesnt exist");
            err.statusCode = 403;
            return next(err);
        }
    }catch(err){next(err)}
}

exports.verifyStock = async(req, res, next) => 
{
    try
    {
        const productLoad = parseFloat(req.body.load), productQuantity = parseInt(req.body.quantity)
        const productId = req.body.productId, userId = req.user.id, cart = await Cart.findOne({userId : userId});
        let findProductId = cart ? cart.products.find(el => el.productId.toString() === productId) : null;
    
        if(findProductId)
        {
            let load = findProductId.productItems.map((productItems) => {return productItems.load;});
            let qty = findProductId.productItems.map((productItems) => {return productItems.quantity;});
    
            let sumWithInitial, err, emptyTable = []
            
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
                    err.statusCode = 403;
                }
            }
            if(err){next(err);}
            else{next();}
        }
        else{next();}
    }catch(err){next(err)}
}

exports.verifyProductId = async(req, res, next) =>
{
    try
    {
        const productId = req.params.productId;

        if(ObjectId.isValid(productId))
        {
            const product = await Product.findOne({_id :productId});
            if(product) return next()
            else
            {
                let err = new Error('This product do not exist : ' + productId);
                err.statusCode = 400;
                next(err);
            }
        }
        else
        {
            let err = new Error('The productId is not an ObjectId : ' + productId);
            err.statusCode = 400;
            next(err);
        }
    }catch(err){next(err)}
}

exports.removeImgs = async(req, res, next) =>
{
    try
    {
        const product = await Product.findOne({_id : req.params.productId})
        
        let imgs = product ? "productsImgs/" + product.imgs : null;
        imgs ? 
        await Promise.all
        (
            imgs.map(async img =>
                {
                    fileUpload.deleteFile(img)
                })
        ) : null;
        
        next();

    }catch(err){next(err)}
    
}

exports.countInStock = async(req, res, next) =>
{
    try
    {
        const userId = req.user ? req.user._id : null;
        const productId = req.params.productId;
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
    }catch(err) {next(err)}
    
}

// RESIZE IMG
exports.resizeProductImage = async(req, res, next) => 
{
    try
    {
        if (!req.files)
        {   
            let err = new Error('Files not found!')
            err.statusCode = 400;
            next(err);
        }
        
        let filesArr = req.files;
        await Promise.all
        (
            filesArr.map(async file => 
                {
                    await sharp(file.path)
                    .resize(200, 200)
                    .toFile(path.resolve(file.destination,'productsImgs', file.filename))
                    fs.unlinkSync(path.join("public/images/", file.filename))
                })
        );
        
        next();
    }catch(err){next(err)}

};

exports.addProductImgs = async(req, res, next) =>
{
    try
    {
        let filesArr = req.files;
        let key = [];
        await Promise.all
        (
            filesArr.map(async(img) => 
                {
                    
                    let file =  path.join(img.destination,'productsImgs', img.filename)
                    let filePath = file, fileName = "productsImgs/" + img.filename, fileType = img.mimetype;
                    
                    let result = await fileUpload.uploadFile(filePath, fileName, fileType);

                    key.push(img.filename); 
                    fs.unlinkSync(path.join("public/images/productsImgs", fileName))
                
                })
        );
        const newProduct = await Product.findOne({title : req.title})
        
        const product = !newProduct ? await Product.findOneAndUpdate({_id: req.params.productId},
            {
                $set:
                {
                    imgs: key
                }
            }) : await Product.findOneAndUpdate({title : req.title},
            {
                $set:
                {
                    imgs: key
                }
            });
        
        await product.save();
        next();
    }catch(err){next(err)}
}
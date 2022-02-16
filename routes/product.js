const Product = require("../models/Product");
const router = require("express").Router();
const _ = require("lodash")
const fs = require('fs');

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');
const product = require('../controllers/product');
const {upload} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE PRODUCT
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
upload.any('imageFile'), product.newProduct, async(req, res) =>
{
    try
    {
        const { title, desc, shape, countInStock } = req.body;
        
        let imgs = req.imgs.map(img => img.replaceAll("\\", "/"))
        let replace = imgs.map(img => img.replace("public/", ""))

        console.log(imgs);
        console.log(replace);

        const newProduct = await new Product(
            {
                title,
                desc,
                shape,
                tags : req.tags,
                imgs: replace,
                productItems: req.product,
                countInStock
            }
        );

        const savedProduct = await newProduct.save();
        res.status(200).json(
            {
                success: true,
                status: "Product Successfull added",
                New_product: savedProduct
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
});

// UPDATE PRODUCT //TODO:  form adaptability // ?myfield=
router.put("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async(req, res) =>
{
    try
    {
        const queryFields = req.query.myfield;
        if(queryFields)
        {
            console.log(queryFields);
            console.log(req.query);
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                $set: 
                {
                    
                }    
            },
            {new: true}
        );
        
        res.status(200).json(
            {
                success: true,
                status: "Product Successfull updated",
                Updated_product: updatedProduct
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
});

// DELETE
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async(req, res) =>
{   
    try
    {
        const removeFile= function (err) {
            if (err) {
                console.log("unlink failed", err);
            } else {
                console.log("file deleted");
            }
        }
        const product = await Product.findOne({_id : req.params.id})
        let productImg = product.imgs;
        let unlickImg = productImg ? productImg.map(img => fs.unlink(img, removeFile)) : null;
        
        await Product.findByIdAndDelete(req.params.id)
        
        res.status(200).json(
            {
                success: true,
                status: "Product has been deleted"
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

// GET PRODUCT BY ID
router.get("/find/:id", async(req, res) =>
{
    try
    {
        const product = await Product.findById(req.params.id)
        res.status(200).json(
            {
                success: true,
                status: "Product found",
                Product: product
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

});

// GET ALL PRODUCTS
router.get("/", cors.corsWithOptions, async(req, res) =>
{
    //method to get only new products with "?new=true" in request
    const queryNew = req.query.new;
    
    //method to get only products with the appropriate tag with "?tags=endurance" for example in request
    const queryTags = req.query.tags;
    
    //const products = queryTags ? find.tags : [product.find()].sort(( queryNew ? {id} : '')).limit(queryNew ? 1 : '')

    //method to get only new products with "?limit=15" in request
    const queryLimit = parseFloat(req.query.limit);
    try
    {
        let products;
        
        if(queryNew)
        {
            // the last products
            products = await Product.find().sort({_id:-1}).limit(1);
        }
        else if(queryTags)
        {
            // the products with the queryTags
            products = await Product.find({tags:{$in: [queryTags]}});
        }
        else if(queryLimit)
        {
            // the products with the quertNumber
            products = await Product.find().sort({_id:-1}).limit(queryLimit);
        }
        else
        {
            // all products
            products = await Product.find();
        }
        
        res.status(200).json(
            {
                // success: true,
                // status: "Products found",
                products
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
    
});

module.exports = router;
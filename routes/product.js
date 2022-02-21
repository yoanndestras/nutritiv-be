const Product = require("../models/Product");
const router = require("express").Router();
const _ = require("lodash")
const fs = require('fs');

// MIDDLEWARES
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');
const product = require('../controllers/productsController');
const {upload} = require('./upload');
const { countInStock } = require("../controllers/ordersController");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE PRODUCT
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
upload.any('imageFile'), product.resizeProductImage, product.newProduct, async(req, res) =>
{
    try
    {
        const { title, desc, shape, countInStock } = req.body;
        
        let imgs = req.imgs.map(img => img.replaceAll("\\", "/"))
        let replace = imgs.map(img => img.replace("public/", ""))
        
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

// UPDATE PRODUCT //TODO:  form adaptability 
router.put("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, product.verifyProductId,
 upload.any('imageFile'), product.newProduct, product.removeImgs, product.resizeProductImage, async(req, res) =>
{
    try
    {
        const { title, desc, shape, countInStock} = req.body;
        
        let imgs = req.imgs.map(img => img.replaceAll("\\", "/"))
        let replace = imgs.map(img => img.replace("public/", ""))
        
        let updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                $set: 
                {
                    title,
                    desc,
                    shape,
                    tags : req.tags,
                    imgs: replace,
                    productItems: req.product,
                    countInStock
                }
            },
            {new: true}
        );
        
        updatedProduct = await updatedProduct.save();

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
                err: err.message
            });
    }
});

// DELETE
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, product.removeImgs, async(req, res) =>
{   
    try
    {
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
});

// GET PRODUCT BY ID
router.get("/findById/:id", async(req, res) =>
{
    try
    {
        const product = await Product.findById(req.params.id).select(['-countInStock'])
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

// GET PRODUCT BY TITLE
router.get("/findByTitle/:title", async(req, res) =>
{
    try
    {
        const title = req.params.title;
        const product = await Product.find({title : title}).select(['-countInStock'])

        if(product.length > 0)
        {
            res.status(200).json(
                {
                    success: true,
                    status: "Product(s) found",
                    Product: product
                });
        }
        else if(product.length === 0)
        {
            res.status(200).json(
                {
                    success: false,
                    status: "Product(s) "+ title +" not found"
                });
        }
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
            products = await Product.find().sort({_id:-1}).limit(1).select(['-countInStock']);
        }
        else if(queryTags)
        {
            // the products with the queryTags
            products = await Product.find({tags:{$in: [queryTags]}}).select(['-countInStock']);
        }
        else if(queryLimit)
        {
            // the products with the quertNumber
            products = await Product.find().sort({_id:-1}).limit(queryLimit).select(['-countInStock']);
        }
        else
        {
            // all products
            products = await Product.find().select(['-countInStock']);
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

// GET COUNTINSTOCK // 
router.get('/countInStock/:id', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
product.verifyProductId, product.countInStock, async (req, res) =>
{
    try
    {
        const countInStock = req.stock;
        
        res.status(200).json(
            {
                countInStock
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
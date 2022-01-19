const Product = require("../models/Product");
const router = require("express").Router();
const _ = require("lodash")

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');
const check = require('../controllers/product');
const {upload} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE PRODUCT
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, upload.any('imageFile'), async(req, res) =>
{
    
    try
    {
        let shape = req.body.shape;
        const files = req.files
        const req_tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags !== undefined ? [req.body.tags] : null;
        const val = Array.isArray(req.body.val) ? req.body.val : req.body.val !== undefined ? [req.body.val] : null;
        let imgs = files.map((el, i) => {return el.path}), tags = req_tags.map((el, i) => {return el});    
        let load;
        
        const PPCapsule = req.body.pricePerCapsule;
        const PPKg = req.body.pricePerKilograms;
        
        if(shape === "capsules" && PPCapsule)
        {
            let milestones = {30: 0.1, 60: 0.2, 120: 0.4, 210: 0.5};
            let keys = Object.keys(milestones), values = Object.values(milestones);
            
            load = val.map((el, i) => {
                price = el * PPCapsule;
                let discountValues = check.discount(values, price, el, keys);
                return {val : discountValues.qty, price :discountValues.price}
            })
        }
        else if(shape === "powder" && PPKg)
        {
            let milestones = { 60: 0, 150: 0.2, 350: 0.4, 1000: 0.5};
            let keys = Object.keys(milestones), values = Object.values(milestones);
            
            load = val.map((el, i) => {
                price = el * (parseFloat(PPKg)/1000);
                let discountValues = check.discount(values, price, el, keys);
                return {val : discountValues.qty, price :discountValues.price}
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
        
        const newProduct = await new Product(
            {
                title: req.body.title,
                desc: req.body.desc,
                shape: req.body.shape,
                tags : tags,
                imgs: imgs,
                load: load,
                countInStock: req.body.countInStock
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

// UPDATE PRODUCT
router.put("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async(req, res) =>
{
    try
    {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                $set: req.body
            },
            {new: true});
        
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
            // the product with the queryTags
            products = await Product.find({tags:{$in: [queryTags]}});
        }
        else
        {
            // all products
            products = await Product.find();
        }
        
        res.status(200).json(
            {
                success: true,
                status: "Products found",
                Product: products
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
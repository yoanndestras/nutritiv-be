const Product = require("../models/Product");
const router = require("express").Router();

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE PRODUCT
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async(req, res) =>
{
    
    try
    {
        const newProduct = new Product(req.body);
        
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
                err: err
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
        
        res.status(200).json(updatedProduct);
        
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

// DELETE
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async(req, res) =>
{   
    try
    {
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json("Product has been deleted...")
    }
    catch(err)
    {
        res.status(500).json(err);
    }

})

// GET PRODUCT BY ID
router.get("/find/:id", async(req, res) =>
{
    try
    {
        const product = await Product.findById(req.params.id)
        res.status(200).json(product);
    }
    catch(err)
    {
        res.status(500).json(err);
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
        
        res.status(200).json({data : products});
    }
    catch(err)
    {
        res.status(500).json(err);
    }
    
});

module.exports = router;
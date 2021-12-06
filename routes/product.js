const Product = require("../models/Product");
const authenticate = require('./verifyToken');
const router = require("express").Router();

// CREATE PRODUCT
router.post("/", authenticate.verifyTokenAndAdmin, async (req, res) =>
{
    const newProduct = new Product(req.body);
    try
    {
        const savedProduct = await newProduct.save();
        
        res.status(200).json(savedProduct);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

// UPDATE PRODUCT
router.put("/:id", authenticate.verifyTokenAndAdmin, async(req, res) =>
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
router.delete("/:id", authenticate.verifyTokenAndAdmin, async (req, res) =>
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

// GET PRODUCT
router.get("/find/:id", async (req, res) =>
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
router.get("/", async (req, res) =>
{
    //method to get only new products with "?new=true" in request
    const queryNew = req.query.new;

    //method to get only products with the appropriate tag with "?tags=endurance" for example in request
    const queryTags = req.query.tags;
    
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
            products = await Product.find({
                tags:
                {
                    $in: [queryTags],
                },
            });
        }
        else
        {
            // all products
            products = await Product.find();
        }
        
        res.status(200).json(products);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
    
});

module.exports = router;
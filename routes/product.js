const Product = require("../models/Product");
const router = require("express").Router();
const _ = require("lodash")
const { slice } = require("lodash");
const fs = require('fs');
const randomWords = require('random-words');

// CONTROLLERS
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');
const product = require('../controllers/productsController');
const {upload} = require('./upload');
const { countInStock } = require("../controllers/ordersController");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET ALL PRODUCTS
router.get("/", cors.corsWithOptions, async(req, res) =>
{
    try
    {
        const allProducts = await Product.find();
        const productsLength = allProducts.length;

        const queryNew = req.query.new, queryTags = req.query.tags;
        const queryLimit = parseInt(req.query.limit); 
        
        const queryStart = req.query.start && req.query.start < 0 ? req.query.start = 0 : parseInt(req.query.start);
        const queryEnd = req.query.end && req.query.end > productsLength ? req.query.end = productsLength: parseInt(req.query.end);

        let products, length;
        
        if(queryNew) 
        {
            products = await Product.find().sort({_id:-1}).limit(1);
        }
        else if(queryTags)
        {
            products = await Product.find({tags:{$in: [queryTags]}});
        }
        else if(queryLimit)
        {
            products = await Product.find().sort({_id:-1}).limit(queryLimit);
        }
        else if(queryStart !== null && queryEnd !== null && queryStart < queryEnd)
        {
            products = await Product.find().sort({_id:-1});
            products = products.slice(queryStart, queryEnd)
        }
        else
        {
            products = allProducts;
        }
        
        length = products.length;
        
        res.status(200).json(
            {
                // success: true,
                // status: "Products found",
                products,
                length
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
router.get("/findById/:productId", cors.corsWithOptions, async(req, res) =>
{
    try
    {
        const product = await Product.findById(req.params.productId)
        if(product)
        {
            res.status(200).json(
                {
                    success: true,
                    status: "Product found",
                    Product: product
                });
        }
        else if(req.params.productId)
        {
            res.status(400).json(
                {
                    success: false,
                    status: "Product with id : "+ req.params.productId +", not found"
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

// GET PRODUCT BY TITLE
router.get("/findByTitle/:productTitle", cors.corsWithOptions, async(req, res) =>
{
    try
    {
        const title = req.params.productTitle;
        const product = await Product.find({title : title})

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
            res.status(400).json(
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

// GET ALL PRODUCTS LENGTH
router.get("/length", cors.corsWithOptions, async(req, res) =>
{
    try
    {
        let products = await Product.find();
        let length = products.length;
        res.status(200).json(
            {
                length
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
router.get('/countInStock/:productId', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
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

// GET TAGS THAT EXIST ON THE LIST OF PRODUCTS
router.get('/tags', cors.corsWithOptions, async (req, res) =>
{
    try
    {
        let products = await Product.find();
        let tags = products.map((product) => product.tags).flat();
        let uniqueTags = [...new Set(tags)]
        
        res.status(200).json(
            {
                uniqueTags
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

// GENERATE PRODUCTS
router.post("/generate/:value", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
async(req, res) =>
{
    try
    {
        let value = req.params.value, newProduct, newProducts = [];
        const shape = ["powder", "capsules"];

        const tags = [
            "anti-oxydant",
            "immunity",
            "longevity",
            "skin",
            "joints",
            "anti-inflammatory",
            "endurance"
        ]

        function randomShapeFunction(){return Math.floor(Math.random() * shape.length)}
        function randomTagFunction(){return Math.floor(Math.random() * tags.length)}
        function randomLoadFunction(){return Math.floor(Math.random()*50)*40}
        function randomPriceFunction(){return Math.floor(Math.random()*50)*10}
        
        for(let i = 0; i < value; i++)
        {
            let randomTitle = randomWords(), randomDesc = randomWords(), randomTag = tags[randomTagFunction()];
            let randomLoad = randomLoadFunction(), randomPrice = randomPriceFunction(), randomShape = shape[randomShapeFunction()];
            
            newProduct = await new Product(
                {
                    title : randomTitle,
                    desc : randomDesc,
                    shape : randomShape,
                    tags : [randomTag],
                    imgs: ["images/productsImgs/RtNaMultivitamines_powder.png"],
                    productItems: [
                    {
                        load : randomLoad,
                        price : 
                        {
                            value : randomPrice,
                            currency : "EUR"
                        }
                    }],
                    countInStock : 20000
                })
            newProducts.push(newProduct);
            await newProduct.save();
        }
        
        res.status(201).json(
            {
                newProducts
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
        res.status(201).json(
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
router.put("/:productId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, product.verifyProductId,
upload.any('imageFile'), product.newProduct, product.removeImgs, product.resizeProductImage, async(req, res) =>
{
    try
    {
        const { title, desc, shape, countInStock} = req.body;
        
        let imgs = req.imgs.map(img => img.replaceAll("\\", "/"))
        let replace = imgs.map(img => img.replace("public/", ""))
        
        let updatedProduct = await Product.findByIdAndUpdate(
            req.params.productId, 
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

        res.status(201).json(
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
router.delete("/delete/:productId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, product.removeImgs, async(req, res) =>
{
    try
    {
        await Product.findByIdAndDelete(req.params.productId)
        
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

//DELETE RECENT PRODUCTS
router.delete("/lastDay", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
{
    const date = new Date();
    const lastDay = new Date(date.setUTCDate(date.getUTCDate() -1));

    try
    {
        let income = await Product.deleteMany( { "createdAt" : {$gt : lastDay } })
            
        res.status(200).json(income);
    }
    catch(err)
    {
        res.status(500).json(err);
    }

})
module.exports = router;
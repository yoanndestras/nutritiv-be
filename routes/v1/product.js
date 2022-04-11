const Product = require("../../models/Product");
const router = require("express").Router();
const _ = require("lodash")
const { slice } = require("lodash");
const fs = require('fs');
const randomWords = require('random-words');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const product = require('../../controllers/v1/productsController');
const {upload} = require('./upload');
const { countInStock } = require("../../controllers/v1/ordersController");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET ALL PRODUCTS
router.get("/", cors.corsWithOptions, async(req, res, next) =>
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
            products = await Product.find().sort({_id:-1}).limit(1).lean();
        }
        else if(queryTags)
        {
            products = await Product.find({tags:{$in: [queryTags]}}).lean();
        }
        else if(queryLimit)
        {
            products = await Product.find().sort({_id:-1}).limit(queryLimit).lean();
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
    
    }catch(err){next(err)}
});

// GET PRODUCT BY ID
router.get("/findById/:productId", cors.corsWithOptions, async(req, res, next) =>
{
    try
    {
        const product = await Product.findById(req.params.productId).lean();
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
    }catch(err){next(err)}
});

// GET PRODUCT BY TITLE
router.get("/findByTitle/:productTitle", cors.corsWithOptions, async(req, res, next) =>
{
    try
    {
        const title = req.params.productTitle;
        const product = await Product.find({title : title}).lean();

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
    }catch(err){next(err)}
});

// GET ALL PRODUCTS LENGTH
router.get("/length", cors.corsWithOptions, async(req, res, next) =>
{
    try
    {
        let products = await Product.find().lean();
        let length = products.length;

        res.status(200).json(
            {
                length
            });
    }catch(err){next(err)}
});

// GET COUNTINSTOCK // 
router.get('/countInStock/:productId', cors.corsWithOptions, auth.verifyUserCart, auth.verifyRefresh, 
product.verifyProductId, product.countInStock, async (req, res, next) =>
{
    try
    {
        const countInStock = req.stock;
        
        res.status(200).json(
            {
                countInStock
            });
    }catch(err){next(err)}
});

// GET TAGS THAT EXIST ON THE LIST OF PRODUCTS
router.get('/tags', cors.corsWithOptions, async (req, res, next) =>
{
    try
    {
        let products = await Product.find().lean();
        let tags = products.map((product) => product.tags).flat();
        let uniqueTags = [...new Set(tags)]
        
        res.status(200).json(
            {
                uniqueTags
            });
    }catch(err){next(err)}
})

// GENERATE PRODUCTS
router.post("/generate/:value", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async(req, res, next) =>
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
                    imgs: ["CDimMultivitamines_powder.png"],
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

    }catch(err){next(err)}
    
})

// CREATE PRODUCT
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
upload.any('imageFile'), product.resizeProductImage, product.newProduct, product.addProductImgs, async(req, res, next) =>
{
    try
    {
        const product = await Product.findOne({title : req.title})
        await product.save();
        res.status(201).json(
            {
                success: true,
                product
            });
    }catch(err){next(err)}
});


// UPDATE PRODUCT //TODO:  form adaptability 
router.post("/updateImgs/:productId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, product.verifyProductId, upload.any('imageFile'), product.removeImgs, 
product.resizeProductImage, product.addProductImgs, async(req, res, next) =>
{
    try
    {
        const product = await Product.findOne({_id : req.params.productId});
        product.save();

        res.status(201).json(
            {
                success: true,
                product
            });
        
    }catch(err){next(err)}
});

// UPDATE PRODUCT //TODO:  form adaptability 
// router.put("/:productId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
//auth.verifyAdmin, product.verifyProductId, product.newProduct, async(req, res, next) =>
// {
//     try
//     {
//         const { title, desc, shape, countInStock} = req.body;

//         let updatedProduct = await Product.findByIdAndUpdate(
//             req.params.productId, 
//             {
//                 $set: 
//                 {
//                     title,
//                     desc,
//                     shape,
//                     tags : req.tags,
//                     productItems: req.product,
//                     countInStock
//                 }
//             },
//             {new: true}
//         );
        
//         updatedProduct = await updatedProduct.save();

//         res.status(201).json(
//             {
//                 success: true,
//                 status: "Product Successfull updated",
//                 Updated_product: updatedProduct
//             });
        
//     }catch(err){next(err)}
// });

// DELETE
router.delete("/single/:productId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, product.removeImgs, async(req, res, next) =>
{
    try
    {
        await Product.findByIdAndDelete(req.params.productId)
        
        res.status(200).json(
            {
                success: true,
                status: "Product has been deleted"
            });
    }catch(err){next(err)}
});

//DELETE RECENT PRODUCTS
router.delete("/lastDay", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
async (req, res, next) =>
{
    const date = new Date();
    const lastDay = new Date(date.setUTCDate(date.getUTCDate() -1));
    try
    {
        let income = await Product.deleteMany( { "createdAt" : {$gt : lastDay } })
        res.status(200).json(income);
    }catch(err){next(err)}

})
module.exports = router;
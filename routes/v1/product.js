const Product = require("../../models/Product");
const router = require("express").Router();
const _ = require("lodash")
// const { slice } = require("lodash");
// const fs = require('fs');
const randomWords = require('random-words');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const product = require('../../controllers/v1/productsController');
const {upload, uploadAny} = require('./upload');
// const { countInStock } = require("../../controllers/v1/ordersController");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET ALL PRODUCTS
router.get("/", cors.corsWithOptions, async(req, res, next) =>
{
    try
    {
        const allProducts = await Product.find().sort({ title: 1 }).collation({ locale: "en", caseLevel: true });
        const productsLength = allProducts.length;
        
        const queryNew = req.query.new, queryCategory = req.query.categories;
        const queryLimit = parseInt(req.query.limit); 
        
        const queryStart = req.query.start && req.query.start < 0 ? req.query.start = 0 : parseInt(req.query.start);
        const queryEnd = req.query.end && req.query.end > productsLength ? req.query.end = productsLength: parseInt(req.query.end);

        let products, length;
        
        if(queryNew) 
        {
            products = await Product.find().sort({_id:-1}).limit(1).lean();
        }
        else if(queryCategory)
        {
            products = await Product.find({categories:{$in: [queryCategory]}}).lean();
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

// GET CATEGORIES THAT EXIST ON THE LIST OF PRODUCTS
router.get('/categories', cors.corsWithOptions, async (req, res, next) =>
{
    try
    {
        let products = await Product.find();
        let categories = products.map((product) => product.categories[0]);
        let uniqueCategory = [...new Set(categories)]
        
        res.status(200).json(
            {
                uniqueCategory
            });
    }catch(err){next(err)}
})

// GENERATE PRODUCTS
// router.post("/generate/:value", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// auth.verifyAdmin, async(req, res, next) =>
// {
//     try
//     {
//         let value = req.params.value, newProduct, newProducts = [];
//         const shape = ["powder", "capsules"];
        
//         const tags = [
//             "anti-oxydant",
//             "immunity",
//             "longevity",
//             "skin",
//             "joints",
//             "anti-inflammatory",
//             "endurance"
//         ]
        
//         function randomShapeFunction(){return Math.floor(Math.random() * shape.length)}
//         function randomTagFunction(){return Math.floor(Math.random() * tags.length)}
//         function randomLoadFunction(){return Math.floor(Math.random()*50)*40}
//         function randomPriceFunction(){return Math.floor(Math.random()*50)*10}
        
//         for(let i = 0; i < value; i++)
//         {
//             let randomTitle = randomWords(), randomDesc = randomWords(), randomTag = tags[randomTagFunction()];
//             let randomLoad = randomLoadFunction(), randomPrice = randomPriceFunction(), randomShape = shape[randomShapeFunction()];
            
//             newProduct = await new Product(
//                 {
//                     title : randomTitle,
//                     desc : randomDesc,
//                     shape : randomShape,
//                     tags : [randomTag],
//                     imgs : ["CDimMultivitamines_powder.png"],
//                     productItems : [
//                     {
//                         load : randomLoad,
//                         price : 
//                         {
//                             value : randomPrice,
//                             currency : "EUR"
//                         }
//                     }],
//                     countInStock : 20000
//                 })
//             newProducts.push(newProduct);
//             await newProduct.save();
//         }
        
//         res.status(201).json(
//             {
//                 newProducts
//             });
    
//     }catch(err){next(err)}
    
// })

// CREATE PRODUCT
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
uploadAny.any('anyFile'), product.resizeProductImage, product.newProduct, 
product.addProductImgs, async(req, res, next) =>
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
        await product.save();

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

// DELETE ALL GLB FILES
// router.put("/glb", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// auth.verifyAdmin, async(req, res, next) =>
// {
//     try
//     {
//         await Product.updateMany({}, [
//             {$set: {imgs: {
//                     $concatArrays: [ 
//                             {$slice: ["$imgs", 1]}, 
//                             {$slice: ["$imgs", {$add: [1, 1]}, {$size: "$imgs"}]}
//                     ]
//             }}}
//         ]);
        
//         res.status(200).json(
//             {
//                 success: true,
//                 status: "Glb files has been deleted from database"
//             });

//     }catch(err){next(err)}
// });

// CHANGE SHAPE NAME FROM PLURIAL TO SINGLE
// router.put("/shapes", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// auth.verifyAdmin, async(req, res, next) =>
// {
//     try
//     {
//         await Product.updateMany({shape : "gummies"}, [
//             {$set: 
//                 {
//                     shape: "gummy"
//                 }
//             }
//         ]);
        
//         res.status(200).json(
//             {
//                 success: true,
//                 status: "Products shape name updated"
//             });
    
//     }catch(err){next(err)}
// });

// CHANGE CATEGORY TYPE FROM STRING TO ARRAY
// router.put("/categories", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// auth.verifyAdmin, async(req, res, next) =>
// {
//     try
//     {
//         await Product.updateMany({categoriy : "unique"}, [
//             {$set: 
//                 {
//                     categories: ["unique"]
//                 }
//             }
//         ]);
        
//         res.status(200).json(
//             {
//                 success: true,
//                 status: "Products categories updated"
//             });
    
//     }catch(err){next(err)}
// });

// // CHANGE CATEGORY TYPE FROM STRING TO ARRAY
// router.put("/category", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// auth.verifyAdmin, async(req, res, next) =>
// {
//     try
//     {
//         await Product.updateMany({}, 
//             {$unset: 
//                 {
//                     category: "",
//                 }
//             }
//         );
        

//         res.status(200).json(
//             {
//                 success: true,
//                 status: "Products category field deleted"
//             });
    
//     }catch(err){next(err)}
// });

// DELETE
router.delete("/single/:productId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, product.removeImgs, async(req, res, next) =>
{
    try
    {
        await Product.findByIdAndDelete(req?.params?.productId)
        
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

//DELETE ALL PRODUCTS
// router.delete("/all", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
// async (req, res, next) =>
// {
//     try
//     {
//         let income = await Product.deleteMany({});
//         res.status(200).json(income);
//     }catch(err){next(err)}

// })

// router.get("/rename", async (req, res, next) =>
// {
//     try
//     {
//         const products = await Product.updateMany({createdAt:{$gte:new Date("2022-02-28").toISOString(),$lt: new Date("2022-02-29").toISOString()}},
//         {
//             $set:
//             {
//                 "imgs": ["CDimMultivitamines_powder.png"],
//             }
//         },
//         {multi: true});

//         res.status(200).json(
//         {
//             success: true,
//             products
//         });
//     }catch(err) {next(err)}
// })

module.exports = router;
const Product = require("../models/Product");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();

// CREATE PRODUCT
router.post("/", verifyTokenAndAdmin, async (req, res) =>
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
})
// UPDATE USER
// router.put("/:id", verifyToken, verifyTokenAndAuthorization, async(req, res) =>
// {
//     if(req.body.password)
//     {
//         req.body.password = CryptoJS.AES.encrypt
//         (
//             req.body.password, 
//             process.env.PASS_SEC
//         ).toString();
//     }
//     try
//     {
//         const updatedUser = await User.findByIdAndUpdate(req.params.id, 
//             {
//                 $set: req.body
//             },
//             {new: true});

//         res.status(200).json(updatedUser);
//     }
//     catch(err)
//     {
//         res.status(500).json(err);
//     }
// })

// // DELETE
// router.delete("/:id", verifyTokenAndAuthorization, async (req, res) =>
// {
//     try
//     {
//         await User.findByIdAndDelete(req.params.id)
//         res.status(200).json("User has been deleted...")
//     }
//     catch(err)
//     {
//         res.status(500).json(err);
//     }

// })

// // GET USER
// router.get("/find/:id", verifyTokenAndAdmin, async (req, res) =>
// {
//     try
//     {
//         const user = await User.findById(req.params.id)

//         const {password, ...others} = user._doc;

//         res.status(200).json({others});
//     }
//     catch(err)
//     {
//         res.status(500).json(err);
//     }

// })

// // GET ALL USERS
// router.get("/", verifyTokenAndAdmin, async (req, res) =>
// {
//     //method to get only new users with "?new=true" in request
//     const query = req.query.new;
    
//     try
//     {
//         //limit value = the number of last users in res
//         const users = query 
//             ? await User.find().sort({_id:-1}).limit(5) 
//             : await User.find();
//         res.status(200).json({users});
//     }
//     catch(err)
//     {
//         res.status(500).json(err);
//     }

// })

module.exports = router;
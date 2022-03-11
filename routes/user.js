const User = require("../models/User");
const router = require("express").Router();

const aws = require('aws-sdk');

// CONTROLLERS
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');
const mailer = require("../controllers/mailerController");
const user = require("../controllers/usersController");
const fileUpload = require('../controllers/fileUploadController');
const {upload} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET ALL USERS
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async (req, res, next) =>
{
    try
    {
        //method to get only new users with "?new=true" in request
        const query = req.query.new;
        
        //limit value = the number of last users in res
        const users = query 
            ? await User.find().sort({_id:-1}).limit(5) 
            : await User.find();
        res.status(200).json({users});
    }catch(err){next(err)}
})

// GET USER STATS
// For admin Dashboard
router.get("/stats", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async (req, res, next) =>
{   
    try
    {
        const date = new Date();
        const lastYear = new Date(date.setFullYear(date.getFullYear() -1));
        
        const data = await User.aggregate(
            [
                {
                    $match: 
                    { //condition : greater than lastYear
                        createdAt: {$gte: lastYear }
                    },
                },
                {
                    $project :
                    { // create the month value for the _id output of data
                        month: {$month: "$createdAt"}
                    },
                },
                {
                    $group:
                    {
                        _id: "$month",
                        // sum every registered user
                        total: { $sum: 1},
                    },
                },
            ]);
        res.status(200).json(data);
    }catch(err){next(err)}
})

// CHECK JWT TOKEN
router.get("/self", cors.corsWithOptions, auth.verifyUser, auth.verifyAuth, 
async(req, res, next) =>
{
    try
    {
        const { username, email, isAdmin, isVerified, addressDetails} = req.user;

        res.status(200).json(
            {
                loggedIn: true,
                username,
                email,
                isAdmin,
                isVerified,
                addressDetails,
                status: "User connected"
            });
    }catch(err){next(err)}
})

// GET USER ADDRESSES
router.get("/selfAddresses", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
    try
    {
        const user =  await User.findOne({_id: req.user._id});
        const addressDetails = user.addressDetails;
        
        res.status(200).json(
            {
                addressDetails
            });
    }catch(err){next(err)}
})

// GET USER AVATAR
router.get("/selfAvatar", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
    try
    {
        const user =  await User.findOne({_id: req.user._id});
        const avatar = user.avatar;
        const readStream = fileUpload.getFileStream(avatar)
        
        let link = process.env.AWS_BUCKET_LINK + user.avatar;
        res.status(200).json(
            {
                link
            });
    
    }catch(err){next(err)}
})

// GET USER // verify user exist in BDD & is connected. Return User info except PWD
router.get("/find/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, async (req, res, next) =>
{
    try
    {
        const user = await User.findById(req.params.userId)
        const {email, ...public} = user._doc;
        
        res.status(200).json({success: true, user: public});
    }catch(err){next(err)}
})


//UPDATE USERNAME
router.put('/updateUsername', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
user.verifyUsername, user.updateUsername, mailer.sendUpdateUsername, async (req, res, next) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        
        res.status(201).json(
            {
                success: true, 
                status: user
            });
    }catch(err){next(err)}
})

//ADD USER ADDRESS
router.put('/addAddress', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
user.maxAmountOfAdresses, user.verifyAddress, async (req, res, next) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        await user.addressDetails.push(req.body);
        await user.save();
        
        res.status(201).json(
            {
                success: true, 
                userInfo: user
            });
    }catch(err){next(err)}
})

//UPDATE USER ADDRESS
router.put('/updateAddress/:addressId', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
user.verifyAddress, user.verifyAdressId, user.updateAddress, async (req, res, next) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        res.status(201).json(
            {
                success: true, 
                addressDetails: user.addressDetails
            });
    }catch(err){next(err)}
})

//DELETE ADDRESS
router.delete('/removeAddress/:addressId', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
user.verifyAdressId, user.deleteAddress, async (req, res, next) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        res.status(200).json(
            {
                success: true, 
                addressDetails: user.addressDetails
            });
    }catch(err){next(err)}
})

//ADD OR REPLACE USER ICON
router.post('/addAvatar', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
upload.single('imageFile'), user.resizeUserAvatar, user.addUserAvatar, async (req, res, next) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        user.save();
        
        let link = process.env.AWS_BUCKET_LINK + user.avatar;
        
        res.status(201).json(
            {
                success: true,
                link
            });
    }catch(err){next(err)}
})

//RESET PASSWORD
router.put("/reset_password", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyNewPasswordSyntax, auth.verifyNewPasswordEquality, async(req, res, next) =>
{
    try
    {
        const oldPass = req.body.oldPass, newPass = req.body.confirmNewPass, user = req.user;
        user.changePassword(oldPass, newPass, (err, user) => 
            {                
                if(err)
                {
                    err.statusCode = 400;
                    next(err)
                }
                else
                {
                    res.status(201).json(
                        {
                            success: true, 
                            status: 'Password has been modified!', 
                            user: user.user
                        });
                }
            });
    }catch(err){next(err)}
});

// DELETE
router.delete("/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, async (req, res, next) =>
{
    try
    {
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json("User has been deleted...")
    }catch(err){next(err)}

})

module.exports = router;
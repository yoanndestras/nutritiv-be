const User = require("../models/User");
const router = require("express").Router();

// CONTROLLERS
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');
const mailer = require("../controllers/mailerController");
const user = require("../controllers/usersController");
const {upload} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET ALL USERS
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
async (req, res) =>
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
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }
})

// GET USER STATS
// For admin Dashboard
router.get("/stats", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async (req, res) =>
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
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }
})

// CHECK JWT TOKEN
router.get("/self", cors.corsWithOptions, auth.verifyUser, auth.verifyAuth, async(req, res) =>
{
    try
    {
        const { username, email, isAdmin, isVerified, adressDetails} = req.user;

        res.status(200).json(
            {
                loggedIn: true,
                username,
                email,
                isAdmin,
                isVerified,
                adressDetails,
                status: "User connected"
            });
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }
})


// GET USER // verify user exist in BDD & is connected. Return User info except PWD
router.get("/find/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        const user = await User.findById(req.params.userId)
        
        const {email, ...public} = user._doc;
        
        res.status(200).json({success: true, user: public});
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }
})


//UPDATE USER
router.put('/updateUser', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async (req, res) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        
        res.status(200).json(
            {
                success: true, 
                status: user
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false, 
                err: err.message
            });
    }
})

//UPDATE USER ADDRESS
router.put('/addAddress', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
user.verifyAddress, async (req, res) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        user.addressDetails.push(req.address);
        user.save();
        
        res.status(201).json(
            {
                success: true, 
                userInfo: user
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false, 
                err: err.message
            });
    }
})

//UPDATE USER ICON
router.put('/addAvatar', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
upload.any('imageFile'), user.resizeUserAvatar, user.addUserAvatar, async (req, res) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});
        user.save();
        
        res.status(201).json(
            {
                success: true, 
                userInfo: user
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false, 
                err: err.message
            });
    }
})

//RESET PASSWORD
router.put("/reset_password", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyNewPasswordSyntax, auth.verifyNewPasswordEquality, async(req, res) =>
{
    try
    {
        const oldPass = req.body.oldPass;
        const newPass = req.body.confirmNewPass;
        const user = req.user;
        
        user.changePassword(oldPass, newPass, (err, user) => 
            {                
                if(err)
                {
                    res.status(400).json(
                        {
                            success: false, 
                            err: 'OldPassword is incorrect'
                        }); 
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
    }
    catch(err)
        {
            res.status(500).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err
                });
        }
});

// DELETE
router.delete("/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json("User has been deleted...")
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }

})

module.exports = router;
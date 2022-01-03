const User = require("../models/User");
const router = require("express").Router();
const email_validator = require("email-validator");

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require('../controllers/authenticate');
const mailer = require("../controllers/mailer");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


//RESET PASSWORD
router.put("/reset_password", cors.cors, auth.verifyUser, auth.verifyRefresh, 
auth.verifyNewPasswordSyntax, auth.verifyNewPasswordEquality, async(req, res, next) =>
{
    try
    {
        var oldPass = req.body.oldPass;
        var newPass = req.body.confirmNewPass;
        var user = req.user;
        
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
                    res.status(200).json(
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
            res.status(400).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err
                });
        }
});

// DELETE
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted...")
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }

})

// GET USER
router.get("/find/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        const user = await User.findById(req.params.id)
        
        const {password, ...public} = user._doc;
        
        res.status(200).json({public});
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }
})

// GET ALL USERS
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
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
router.get("/stats", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
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

// UPDATE USER
// router.put("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyAuthorization, auth.verifyRefresh, async(req, res) =>
// {
//     try
//     {        
//         if(req.body.email)
//         {
//             const valid_email = email_validator.validate(req.body.email);
//             if(valid_email == true){}
//             else{req.body.email = undefined;}
//         }
        
//         const updatedUser = await User.findByIdAndUpdate
//         (req.params.id, {$set: {"username": req.body.username, "email": req.body.email,}},{new: true});
        
//         await updatedUser.save();
//         res.status(200).json(updatedUser);
//     }
//     catch(err)
//     {
//         res.status(500).json({success: false, err: err.message});
//     }
// })

module.exports = router;
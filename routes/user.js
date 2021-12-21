const User = require("../models/User");
const router = require("express").Router();
const email_validator = require("email-validator");

// MIDDLEWARES
const cors = require('../middleware/cors');
const authenticate = require('../middleware/authenticate');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// UPDATE USER
router.put("/:id", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAuthorization, async(req, res) =>
{
    try
    {        
        if(req.body.email)
        {
            const valid_email = email_validator.validate(req.body.email);
            if(valid_email == true){}
            else{req.body.email = undefined;}
        }
        
        const updatedUser = await User.findByIdAndUpdate
        (req.params.id, {$set: {"username": req.body.username, "email": req.body.email,}},{new: true});
        
        if(req.body.password)
        {
            if(req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)){}
            else{return res.status(400).json({success: false, status: 'Update User Unsuccessful!', err: "Wrong password syntax"});}
            
            await updatedUser.setPassword(req.body.password);}
        else{};
        
        await updatedUser.save();
        res.status(200).json(updatedUser);
    }
    catch(err)
    {
        res.status(500).json({success: false, err: err.message});
    }
})

// DELETE
router.delete("/:id", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAuthorization, async (req, res) =>
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
router.get("/find/:id", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAuthorization, async (req, res) =>
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
router.get("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAdmin, async (req, res) =>
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
router.get("/stats", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAdmin, async (req, res) =>
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

module.exports = router;
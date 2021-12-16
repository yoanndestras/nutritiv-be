const User = require("../models/User");
const router = require("express").Router();

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
        const updatedUser = await User.findByIdAndUpdate(req.params.id, 
            {
                $set: req.body
            },
            {new: true});

        res.status(200).json(updatedUser);
    }
    catch(err)
    {
        res.status(500).json(err);
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
        res.status(500).json(err);
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
        res.status(500).json(err);
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
        res.status(500).json(err);
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
        res.status(500).json(err);
    }

})

module.exports = router;
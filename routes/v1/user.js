const router = require("express").Router();
const User = require("../../models/User");
const Chat = require("../../models/Chat");
// const aws = require('aws-sdk');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const mailer = require("../../controllers/v1/mailerController");
const user = require("../../controllers/v1/usersController");
const fileUpload = require('../../controllers/v1/fileUploadController');
const {upload} = require('./upload');

const limitter = require('express-rate-limit');

router.use( 
    limitter(
        {
            windowMs: 5000,
            max: 5,
            message: {
                code: 429,
                message: "Too many requests"
            }
        })
    ) // LIMIT SPAM REQUESTS TO MAX PER MILLISECONDS

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET ALL USERS
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async (req, res, next) =>
{
    try
    {
        //method to get only new users with "?new=true" in request
        const query = req.query.new;
        
        //limit value = the number of last users in res
        const users = query 
            ? await User.find().sort({_id:-1}).limit(5)
            : await User.find()
        
        let newUsersArray = [];
        users.forEach((user) =>
        {
            let avatar = (user.avatar).substring(0, 4) === "http" ? user.avatar : process.env.AWS_BUCKET_LINK + "usersAvatar/" + user.avatar;
            
            let username = user.username;
            let userId = user._id;
            
            let userInfos = {userId, username, avatar}
            
            newUsersArray.push(userInfos) 
        })
        
        res.status(200).json(newUsersArray);
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
        const user =  await User.findOne({_id: req.user._id});
        let avatar = (user.avatar).substring(0, 4) === "http" ? user.avatar : process.env.AWS_BUCKET_LINK + "usersAvatar/" + user.avatar;
        const { username, _id, email, isAdmin, isVerified, addressDetails} = req.user;
        const chatExist = await Chat.findOne({members: {$in: [req.user._id]}});

        let hasChat;
        !chatExist ? hasChat = false : hasChat = true;
        
        let hasTFA;
        !user.TFASecret ? hasTFA = false : hasTFA = true;

        res.status(200).json(
            {
                loggedIn: true,
                _id,
                username,
                email,
                avatar,
                isAdmin,
                isVerified,
                addressDetails,
                hasTFA,
                hasChat,
                status: "User connected"
            });
    }catch(err){next(err);}
})

// GET USER ADDRESSES
router.get("/selfAddresses", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
    try
    {
        const user =  await User.findOne({_id: req.user._id}).lean();
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
        let avatar = (user.avatar).substring(0, 4) === "http" ? user.avatar : process.env.AWS_BUCKET_LINK + "usersAvatar/" + user.avatar;
        // const readStream = fileUpload.getFileStream(avatar)
        
        res.status(200).json(
            {
                avatar
            });
    
    }catch(err){next(err)}
})

// GET USER // verify user exist in BDD & is connected. Return User info except PWD
router.get("/find/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, async (req, res, next) =>
{
    try
    {
        const user = await User.findById(req.params.userId);
        if(user)
        {

            let avatar = (user.avatar).substring(0, 4) === "http" ? user.avatar : process.env.AWS_BUCKET_LINK + "usersAvatar/" + user.avatar;
            const {email, ...publicInfo} = user._doc;
            
            res.status(200).json({success: true, user: publicInfo, avatar});
        }
        else if(!user)
        {
            let error = new Error("User has not been found!")
            res.status(400).json({success: false, error});
        }
        
    }catch(err){next(err)}
})

// GET USERS 
router.get("/findUsers", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin,
async (req, res, next) =>
{
    try
    {
        const usersArray = req.body?.users;
        if(usersArray && Array.isArray(usersArray))
        {
            let users = [];
            
            for (let i = 0; i < usersArray.length; i++)
            {
                const user = await User.findById(usersArray[i]);
                if(user)
                {
                    let avatar = (user.avatar).substring(0, 4) === "http" ? user.avatar : process.env.AWS_BUCKET_LINK + "usersAvatar/" + user.avatar;
                
                    let username = user.username;
                    let userId = user._id
                    
                    let userInfos = {userId, username, avatar}
                    
                    users.push(userInfos)
                }
                else
                {
                    let err = new Error("This id do not exist : " + usersArray[i])
                    err.statusCode = 400;
                    next(err)
                }
                
            }
            
            res.status(200).json({success: true, users});
        }
        else
        {
            let err = new Error("Pls enter an array of userId!")
            err.statusCode = 400;
            next(err)
        }
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

//UPDATE EMAIL ADDRESS
router.put('/updateEmail', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
user.verifyEmail, user.updateEmail, mailer.sendUpdateEmail, async (req, res, next) =>
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
        
        let avatar = (user.avatar).substring(0, 4) === "http" ? user.avatar : process.env.AWS_BUCKET_LINK + "usersAvatar/" + user.avatar;
        
        res.status(201).json(
            {
                success: true,
                avatar
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
                            user: user
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
        let user = req.user;
        if((user.avatar).substring(0, 4) !== "http")
        {
            let avatar = process.env.DB_NAME + "/usersAvatar/" + user.avatar;
            
            user.avatar !== "PrPhdefaultAvatar.jpg" && fileUpload.deleteFile(avatar);
        }
        
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json("User has been deleted...")
    }catch(err){next(err)}
})


// router.put('/provider', async(req, res, next) => 
// {
    
//     const user = await User.find();
//     user.map(async user => 
//         {
//             !user.provider ? user.provider = "local" : null;
//             await user.save();
//         })
// }); // HEALTH CHECK ENDPOINT

module.exports = router;
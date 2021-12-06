const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const authenticate = require('./verifyToken');



//REGISTER
router.post("/register", async(req, res) =>
{
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt
        (
            req.body.password, 
            process.env.PASS_SEC
        ).toString(),
    });
    
    try
    {
        const savedUser = await newUser.save(); // It takes couple millisecondes so we use async await
        res.status(201).json(savedUser) // 201 = statusCode for "successfull and added"
    }
    catch(err)
    {
        res.status(500).json(err);
    }
    
});

//LOGIN

router.post("/login", async (req, res)=>
{
    try
    {
        //Find user with the username of request, (username :{unique : true})
        const user = await User.findOne({username: req.body.username});
        
        // if no user, display : Unknown username! !
        !user && res.status(401).json({success: false, status: "Login Unsuccessful!", err: "Unknown username!"});
        
        const hashedPassword = CryptoJS.AES.decrypt
        (
            user.password, 
            process.env.PASS_SEC
        );
        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        
        // if wrong password, display : Wrong password !
        OriginalPassword !== req.body.password && res.status(401).json({success: false, status: "Login Unsuccessful!", err: "Wrong password!"});
            
        // using spread operators to get all except password for react app
        // user._doc return only user information
        const {password, ...public} = user._doc; 
        
        //JWT Token using
        const accessToken = authenticate.GenerateAccessToken(public);
        
        //JWT RefreshToken using
        const refreshToken = authenticate.GenerateRefreshToken(public);
        
        res.status(200).json({success: true, username: user.username, isAdmin: user.isAdmin, accessToken, refreshToken});
    
    }
    catch(err)
    {
        return res.status(500).json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
    }
    
});


// //REFRESHTOKEN

// router.post("/refreshToken", async (req, res)=>
// {
//     try
//     {
//         const token = req.headers.token;
        
//         let base64Url = token.split('.')[1]; // token you get
//         let base64 = base64Url.replace('-', '+').replace('_', '/');
//         let decodedData = JSON.parse(Buffer.from(base64, 'base64').toString('binary'));
        
//         console.log(decodedData);
//         const user = await User.findOne({_id: decodedData._id});
        
//         // if no user, display : Wrong logs !
//         !user && res.status(401).json("User do not exist!");
        
//         const {password, ...public} = user._doc; 
        
//         //JWT RefreshToken using
//         const refreshToken = jwt.sign
//         (
//             public,
//             process.env.REF_JWT_SEC,
//             {expiresIn: "1y"}
//         );
        
//         // spread operator to only show others content
//         res.status(200).json({accessToken: refreshToken});
    
//     }
//     catch(err)
//     {
//         return res.status(500).json({ error: JSON.stringify(err) });
//     }
    
// });

// LOGOUT

// router.post("/logout", verifyToken, async(req, res) =>
// {
//     const accessToken = req.headers.token;
//     console.log(req.headers.token);
//     try
//     {

//         accessToken = accessToken.filter((token) => token !== accessToken);

//         res.status(200).json("You are succesfully logged out!");
//     }
//     catch(err)
//     {
//         res.status(500).json(err);
//     }
// });

module.exports = router;
const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const authenticate = require('./tokenAuth');

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
        const accessToken = authenticate.GenerateAccessToken({username: user.username, isAdmin: user.isAdmin});
        
        //JWT RefreshToken using
        const refreshToken = authenticate.GenerateRefreshToken({username: user.username, isAdmin: user.isAdmin});

        await User.updateOne
        (
            {username: req.body.username},
            {
                $push: { refreshTokens: refreshToken}
            },
        )
        
        res.status(200).json({success: true, username: user.username, isAdmin: user.isAdmin, accessToken, refreshToken});
    
    }
    catch(err)
    {
        return res.status(500).json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
    }
    
});

// REFRESH TOKEN

router.post("/token", authenticate.verifyRefreshToken, async(req, res) =>
{   
    try
    {
        const refreshToken = req.headers.token;

        !refreshToken && res.status(401).json({success: false, err: "No refreshToken in req.headers.token!"});
        
        let token = refreshToken.split(".")[1];
        let base64 = token.replace("-", "+").replace("_", "/");
        let decodedData = JSON.parse(Buffer.from(base64, "base64").toString("binary"));
        
        const user = await User.findOne({username: decodedData.username});
        
        !user.refreshTokens.includes(refreshToken) && res.status(403).json({success: false, err: "This refreshToken isn't in user.refreshTokens!"});
        
        // Generate AccessToken at refreshToken
        const accessToken = authenticate.GenerateAccessToken({username: user.username, isAdmin: user.isAdmin});
        
        res.status(200).json({success: true, accessToken: accessToken});
                
    }
    catch(err)
    {
        res.status(500).json({success: false, status: 'Refresh Token Generation Unsuccessful!', err: 'Could not /token!'});
    }
});

// DELETE TOKEN // LOGOUT

router.delete("/logout", authenticate.verifyRefreshToken, async(req, res) =>
{   
    try
    {
        const refreshToken = req.headers.token;

        !refreshToken && res.status(401).json({success: false, err: "No refreshToken in req.headers!"});
        
        let token = refreshToken.split(".")[1];
        let base64 = token.replace("-", "+").replace("_", "/");
        let decodedData = JSON.parse(Buffer.from(base64, "base64").toString("binary"));
        
        const user = await User.findOne({username: decodedData.username});        
        !user.refreshTokens.includes(refreshToken) && res.status(403).json({success: false, err: "This refreshToken isn't in user.refreshTokens!"});
        
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.save();
        
        res.status(200).json({success: true, refreshTokenRemoved: user.refreshTokens});
        
    }
    catch(err)
    {
        res.status(500).json({success: false, status: 'Logout Unsuccessfull!', err: 'Could not /logout!'});
    }
});

module.exports = router;
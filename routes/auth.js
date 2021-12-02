const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");


//REGISTER
router.post("/register", async(req, res) =>
{
    const newUser = new User({
        username: req.body.formData.username,
        email: req.body.formData.email,
        password: CryptoJS.AES.encrypt
        (
            req.body.formData.password, 
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
        const user = await User.findOne({username: req.body.formData.username});
        
        // if no user, display : Wrong logs !
        !user && res.status(401).json("Wrong user !");
        
        const hashedPassword = CryptoJS.AES.decrypt
        (
            user.password, 
            process.env.PASS_SEC
        );
        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        
        // if wrong password, display : Wrong logs !
        OriginalPassword !== req.body.formData.password && res.status(401).json("Wrong password !");
    
        //JWT Token using
        const accessToken = jwt.sign
        (
            {
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SEC,
            {expiresIn: "3d"}
        );
        
        // using spread operators to get all except password for react app
        // user._doc return only user information
        const {password, ...others} = user._doc; 
        
        // spread operator to only show others content
        res.status(200).json({ ...others, accessToken});
    
    }
    catch(err)
    {
        return res.status(500).json({ error: JSON.stringify(err) });
    }
    
});

// LOGOUT

router.post("/logout", verifyToken, async(req, res) =>
{
    const accessToken = req.body.token;

    //accessTokens = 
});

module.exports = router;
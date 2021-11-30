const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

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
        const user = await User.findOne({username: req.body.username});
        
        // if no user, display : Wrong logs !
        !user && res.status(401).json("Wrong logs !");

        const hashedPassword = CryptoJS.AES.decrypt
        (
            user.password, 
            process.env.PASS_SEC
        );
        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        
        // if wrong password, display : Wrong logs !
        OriginalPassword !== req.body.password && res.status(401).json("Wrong logs !");
    
        //JWT Token using
        const accessToken = jwt.sign(
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
        res.status(500).json(err);
    }
    
})
module.exports = router;
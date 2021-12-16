const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");

// MIDDLEWARES
const cors = require('../middleware/cors');
const authenticate = require("../middleware/authenticate");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

//REGISTER
router.post("/register", (req, res) =>
{
    User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, async(err, user) =>
    {
        try
        {
            await user.save(() =>
            {
                res.status(201).json(
                    {
                        success: true, 
                        status: 'Registration Successful!', 
                    }); // 201 = statusCode for "successfull and added"
            })
        }
        catch(error)
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'Registration Unsuccessful!', 
                    err: err.message
                });
        }
    })
});

//LOGIN
router.post("/login", cors.corsWithOptions, async(req, res, next)=>
{
    passport.authenticate('local', { session: false }, (err, user, info) => 
    {
        if(err || !user)
        {
            return res.status(401).json(
                {
                    success: false, 
                    status: 'Login Unsuccessful!', 
                    info: info,
                    err: err
                });
        }
        else
        {
            req.login(user, { session: false }, async(err) => 
            {
                if (err) 
                {
                    return res.status(401).json(
                        {
                            success: false, 
                            status: 'Login Unsuccessful!', 
                            err: 'Could not log in user!'
                        });
                }
                
                const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});
                const refreshToken = authenticate.GenerateRefreshToken({_id: req.user._id});
                
                res
                .cookie("refreshToken", refreshToken, 
                    {
                        httpOnly: true,
                        secure: process.env.REF_JWT_SEC_COOKIE === "prod",
                        //SameSite: Lax
                    })
                .status(200).json(
                    {
                        success: true, 
                        status: 'Login Successful!',
                        accessToken: accessToken,
                        // refreshToken: refreshToken
                    });
            });
        }
    })(req, res, next);
});

// REFRESH TOKEN
router.post("/token", cors.corsWithOptions, authenticate.verifyUser, async(req, res) =>
{   
    try
    {
        // Generate new accessToken
        const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});
        
        res.status(200).json(
            {
                success: true, 
                accessToken: accessToken
            });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false, 
                status: 'Access Token Generation Unsuccessful!', 
                err: 'Could not /token!',
            });
    }
});

// CLEAR COOKIE TOKEN // LOGOUT
router.get("/logout", cors.corsWithOptions, authenticate.verifyUser, async(req, res) =>
{   
    try
    {
        return  res
                .clearCookie("refreshToken")
                .status(200)
                .json(
                    {
                        success: true, 
                        status: "Successfully logged out!"
                    });
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false, 
                status: 'Logout Unsuccessfull!', 
                err: err.message
            });
    }
});

module.exports = router;
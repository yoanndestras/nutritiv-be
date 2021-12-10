const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const express = require('express');
const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken");
const passport = require("passport");
const authenticate = require("../authenticate");

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//REGISTER
router.post("/register", (req, res) =>
{   
    User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, (err, user) =>
    {
        if(err)
        {
            return res.status(500).json(
                {
                    success: false, 
                    status: 'Registration Unsuccessful!', 
                    err: err
                });
        }
        else
        {
            user.save((err, user) =>
            {
                res.status(201).json(
                    {
                        success: true, 
                        status: 'Registration Successful!', 
                        user: user
                    }); // 201 = statusCode for "successfull and added"
            })
        }
    })
});

//LOGIN
router.post("/login", async(req, res, next)=>
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
                    })
                .status(200).json(
                    {
                        success: true, 
                        status: 'Login Successful!',
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    });
            });
        }
    })(req, res, next);
});

// REFRESH TOKEN
router.post("/token", authenticate.verifyUser, authenticate.verifyCookieRefreshToken, async(req, res) =>
{   
    try
    {
        const refreshToken = req.cookies.refreshToken;
        
                
        !refreshToken && res.status(401).json(
            {
                success: false, 
                err: "No refreshToken in req.cookies.refreshToken!"
            });
        
        // Generate new accessToken
        const accessToken = authenticate.GenerateAccessToken(
            {
                _id: req.user._id
            });
        
        res.status(200).json({success: true, accessToken: accessToken});
                
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false, 
                status: 'Refresh Token Generation Unsuccessful!', 
                err: 'Could not /token!',
            });
    }
});

// CLEAR COOKIE TOKEN // LOGOUT
router.get("/logout", authenticate.verifyUser, authenticate.verifyCookieRefreshToken, async(req, res) =>
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
                err: 'Could not /logout!'
            });
    }
});

module.exports = router;
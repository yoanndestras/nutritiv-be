const router = require("express").Router();
const User = require("../models/User");
const express = require('express');
const cors = require('../cors');

const jwt = require("jsonwebtoken");
const passport = require("passport");
const authenticate = require("../authenticate");

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

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
            user.save((user) =>
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
router.post("/token", authenticate.verifyUser, async(req, res) =>
{   
    try
    {
        // Generate new accessToken
        console.log(req.user._id)
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
                err: 'Could not /logout!'
            });
    }
});

//CHECK JWT VALIDITY
router.get('/checkJWTToken', cors.corsWithOptions, (req, res) =>
{
    passport.authenticate('jwt', {session: false}, (err, user, info) =>
    {

        if(err || !user)
        {
            return res.status(401).json(
                {
                    success: false, 
                    status: 'JWT invalid!', 
                    info: info,
                    err: err
                });
        }
        else
        {
            return res.status(200).json(
                {
                    status: 'JWT valid!', 
                    success: true, 
                    user: user
                });
        }
    })(req, res);
});

module.exports = router;
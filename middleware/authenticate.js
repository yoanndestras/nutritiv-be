const authenticate = require("./authenticate");

const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

require('dotenv').config();

const passportJWT = require("passport-jwt");
const JwtStrategy   = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

exports.local = passport.use(new LocalStrategy(User.authenticate()));

const opts = {}; //json web token and key
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SEC;

exports.jwtPassport = passport.use("jwt", new JwtStrategy(opts, (jwtPayload, done) =>
{
    User.findOne({_id: jwtPayload._id}, (err, user) =>
        {                
            if(err)
            {
                return done(err, false);
            }
            else if(user)
            {
                return done(null, user);
            }
            else
            {
                return done(null, false);
            }
        })
}));

const cookieExtractor = function(req) 
{
    var token = null;
    if (req && req.cookies) token = req.cookies['refreshToken'];
    return token;
};

const opts_ref = {}; //json web token and key
opts_ref.jwtFromRequest = cookieExtractor;
opts_ref.secretOrKey = process.env.REF_JWT_SEC;

// named "jwt_rt" to check only the refreshtoken in cookies
exports.RFJwtPassport = passport.use("jwt_rt", new JwtStrategy(opts_ref, (jwtPayload, done) => 
{
    User.findOne({_id: jwtPayload._id}, (err, user) =>
        {                
            if(err)
            {
                return done(err, false);
            }
            else if(user)
            {
                return done(null, user);
            }
            else
            {
                return done(null, false);
            }
        });
}));

// VERIFY USER TOKEN 
exports.verifyUser = (req, res, next) => 
{
    passport.authenticate('jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {   
            req.user = "error";
            return next();
        }
        else if (user.isVerified == false)
        {
            var err = new Error('You account has not been verified. Please check your email to verify your account');
            err.status = 403;
            return next(err);
        }
        
        req.user = user;
        return next();
    
    })(req, res, next); 
};

// VERIFY REFRESH TOKEN 
exports.verifyRefresh = (req, res, next) => 
{
    if(req.user == "error")
    {
        passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
        {        
            if (err || !user) 
            {
                return res.status(500).json(
                    {
                        success: false, 
                        status: "You are not connected", 
                        err: "No refreshToken cookie found or its not valid",
                    });
            }
            
            const accessToken = authenticate.GenerateAccessToken({_id: user._id});
            const refreshToken = authenticate.GenerateRefreshToken({_id: user._id});
            
            res
                .header('Authorization', 'Bearer '+ accessToken)
                .cookie("refreshToken", refreshToken, 
                    {
                        httpOnly: true,
                        secure: process.env.REF_JWT_SEC_COOKIE === "prod"
                        //sameSite: "Lax"
                    });
            
            req.user = user;
            next();
        })(req, res, next);  
    }
    else
    {
        next();
    }
}

// VERIFY ADMIN
exports.verifyAdmin = function(req, res, next)
{
        if(req.user.isAdmin == true)
        {
            next();
        }
        else
        {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
};

exports.verifyAuthorization = (req, res, next) =>
{
    try
    {
        var userId = JSON.stringify(req.user._id).replace(/\"/g, "");
    
        if( userId === req.params.id || req.user.isAdmin == true)
        {
            next();
        }
        else
        {
            res.status(403).json("You are not allowed to do that !");
        }
    }
    catch(err)
    {
        res.status(500).json(
            {
                status: false,
                err: err.message,
            });
    }
    

};

// GENERATE TOKENS
exports.GenerateAccessToken = function(_id) 
{
    
    return jwt.sign
    (
        _id, 
        process.env.JWT_SEC, 
        {expiresIn: "1800s"} // expires in 15 minutes
    );
};

exports.GenerateRefreshToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.REF_JWT_SEC,
        {expiresIn: "7d"} // expires in 7 days
    );
};
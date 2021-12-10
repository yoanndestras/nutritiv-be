const authenticate = require("./authenticate");

const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');

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

exports.jwtPassport = passport.use(new JwtStrategy(opts,
(jwtPayload, done) =>
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
}
));

// GENERATE TOKENS
exports.GenerateAccessToken = function(user) 
{
    return jwt.sign
    (
        user, 
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

// VERIFY USER TOKEN 

exports.verifyUser = passport.authenticate('jwt', {session: false});

// VERIFY USER TOKEN AND ADMIN

exports.verifyTokenAndAdmin = (req, res, next) =>
{
    authenticate.verifyUser(req, res, () =>
    {
        if(req.user.isAdmin == true)
        {
            next();
        }
        else
        {
            res.status(403).json("You are not allowed to do that !");
        }
    });
};

exports.verifyRefreshToken = (req, res, next) =>
{
    const token = req.headers.token;

    if(token)
    {
        authenticate.verifyRefreshTokenFunction({token: token});
        next();
    }
    else
    {
        return res.status(401).json("You are not authenticated !");
    }    
};


exports.verifyCookieRefreshToken = (req, res, next) =>
{
    const token = req.cookies.refreshToken;

    if(token)
    {
        authenticate.verifyRefreshTokenFunction({token: token});
        next();
    }
    else
    {
        return res.status(401).json("You are not authenticated !");
    }    
};

exports.verifyRefreshTokenFunction = (req, res, next) =>
{
    const token = req.token;

    if(token)
    {
        
        jwt.verify(req.token, process.env.REF_JWT_SEC, (err, user) =>
        {
            if(err) res.status(403).json(
                {
                    success: false, err: "invalid_token", 
                    error_description: "The cookie refresh token do not exist"
                });
            req._id = user._id
        });
    }
    else
    {
        return res.status(401).json("You are not authenticated !");
    }
    return  req._id;
}

exports.verifyTokenAndAuthorization = (req, res, next) =>
{
    authenticate.verifyUser(req, res, () =>
    {
        if(req.user._id === req.params.id || req.user.isAdmin == true)
        {
            next();
        }
        else
        {
            res.status(403).json("You are not allowed to do that !");
        }
    });
};




// exports.verifyToken = (req, res, next) =>
// {
//     const autHeader = req.headers["authorization"];
    
//     if(autHeader)
//     {
        
//         const token = autHeader.split(" ")[1];
//         jwt.verify(token, process.env.JWT_SEC, (err, user) =>
//         {
//             if(err) res.status(403).json(
//                 {
//                     success: false, 
//                     err: "invalid_token", 
//                     error_description: "The access token expired"
//                 });
//             req.user = user;
//             next();
//         });
//     }
//     else
//     {
//         return res.status(401).json("You are not authenticated !");
//     }
// };
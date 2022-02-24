const authenticate = require("./authController");

const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const email_validator = require("email-validator");

require('dotenv').config();

const passportJWT = require("passport-jwt");
const JwtStrategy   = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

passport.use(User.createStrategy()); // used to configure main options of passportlocalMongoose authentification
exports.local = passport.use(new LocalStrategy(User.authenticate()));

const opts = {}; //json web token and key
opts.jwtFromRequest = ExtractJwt.fromHeader("access_token");
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
    let token = null;
    if (req && req.cookies) token = req.cookies['refreshToken'];
    return token;
};

const opts_ref = {}; //json web token and key
//opts_ref.jwtFromRequest = cookieExtractor;
opts_ref.jwtFromRequest = ExtractJwt.fromHeader("refresh_token");
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

const Email_token = function(req) 

{
    let token = null;
    if (req && req.query) token = req.query.token;
    return token;
};

const opts_email = {}; //json web token and key
opts_email.jwtFromRequest = Email_token;
opts_email.secretOrKey = process.env.JWT_EMAIL;

exports.jwtPassport = passport.use("email_jwt", new JwtStrategy(opts_email, (jwtPayload, done) =>
{
    User.findOne({email: jwtPayload.email}, (err, user) =>
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



// VERIFY PRIVILEGES
exports.verifyAdmin = function(req, res, next)
{
        if(req.user.isAdmin == true)
        {
            next();
        }
        else
        {
            let err = new Error('You are not authorized to perform this operation!');
            err.statusCode = 403;
            return next(err);
        }
};

exports.verifyAuthorization = async(req, res, next) =>
{
    try
    {
        
        let userId = JSON.stringify(req.user._id).replace(/\"/g, "");
        if( userId === req.params.id || req.user.isAdmin == true)
        {
            next();
        }
        else
        {
            let err = new Error('You are not authorized to perform this operation!');
            err.statusCode = 403;
            return next(err);
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

exports.verifyUser = (req, res, next) => 
{
    passport.authenticate('jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {   
            req.user = "error";
            return next();
        }
        else if (user.isVerified === false)
        {
            let err = new Error('You account has not been verified. Please check your email to verify your account');
            err.statusCode = 403;
            return next(err);
        }
        req.user = user;
        return next();
    
    })(req, res, next); 
};

exports.verifyRefresh = (req, res, next) => 
{
    if(req.user == "error")
    {
        passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
        {        
            if (err || !user) 
            {
                return res.status(401).json(
                    {
                        success: false, 
                        status: "You are not connected", 
                        err: "No refreshToken found or its not valid",
                    });
            }
            else
            {
                const accessToken = authenticate.GenerateAccessToken({_id: user._id});
                const refreshToken = authenticate.GenerateRefreshToken({_id: user._id});
                
                res
                    .header('access_token', accessToken)
                    .header('refresh_token', refreshToken)
                    .cookie("refresh_token", refreshToken, 
                        {
                            httpOnly: true,
                            secure: process.env.REF_JWT_SEC_COOKIE === "prod"
                            //sameSite: "Lax"
                        })
                
                req.user = user;
                next();
            }
            
            
        })(req, res, next);  
    }
    else
    {
        next();
    }
};

exports.verifyAuth = (req, res, next) => 
{
    if(req.user == "error")
    {
        passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
        {        
            if (err || !user) 
            {                
                return res.status(200).json(
                    {
                        loggedIn: false,
                        status: "User not connected"
                    });
            }
            else
            {
                const accessToken = authenticate.GenerateAccessToken({_id: user._id});
                const refreshToken = authenticate.GenerateRefreshToken({_id: user._id});
                
                res
                    .header('accessToken', accessToken)
                    .header('refreshToken', refreshToken)
                    .cookie("refreshToken", refreshToken, 
                        {
                            httpOnly: true,
                            secure: process.env.REF_JWT_SEC_COOKIE === "prod"
                            //sameSite: "Lax"
                        })
                
                req.user = user;
                next();
            }
            
            
        })(req, res, next);  
    }
    else
    {
        next();
    }
};

exports.verifyNoRefresh = (req, res, next) => 
{
    passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
    {        
        if (err || !user) 
        {
            next();
        }
        else
        {
            let err = new Error('You are connected');
            err.statusCode = 500;
            return next(err);
        }
    })(req, res, next);  
};


// GENERATE JWT TOKENS
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

exports.GenerateEmailToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.JWT_EMAIL,
        {expiresIn: "1d"} // expires in 1 days
    );
};

exports.GeneratePasswordToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.JWT_PASSWORD,
        {expiresIn: "1d"} // expires in 1 days
    );
};


// VERIFY REGISTER FORM
exports.verifyEmailSyntax = (req, res, next) =>
{
    console.log(req.body.formData);
    const valid_email = req.body.formData.email && email_validator.validate(req.body.formData.email);
    
    if(valid_email === true)
    {
        console.log("Im here email syntax");
        next();
    }
    else
    {
        let err = new Error('You Email syntax is wrong!');
        err.statusCode = 400;
        return next(err);
    }

};

exports.verifyPasswordSyntax = (req, res, next) =>
{
    if(req.body.formData.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) // password 8 characters, 1 low 1 upper 1 number
    {
        console.log("Im here password syntax");
        next();
    }
    else
    {
        let err = new Error('You password syntax is wrong!');
        err.statusCode = 400;
        return next(err);
    }
};

exports.verifyUsername = (req, res, next) =>
{
    User.findOne({username: req.body.formData.username}, (err, user) =>
        {
            if(user !== null)
            {
                let err = new Error('An account with your username already exists!');
                err.statusCode = 400;
                return next(err);
            }
            else
            {
                console.log("Im here username");
                next();
            }
        })
};

exports.verifyEmail = (req, res, next) =>
{
    User.findOne({email: req.body.formData.email}, (err, user) =>
        {
            if(user !== null)
            {
                let err = new Error('An account with your email already exists!');
                err.statusCode = 400;
                return next(err);
            }
            else
            {
                console.log("Im here email");
                next();
            }
        })
};

exports.verifyNewPasswordEquality = (req, res, next) =>
{
    let password1 = req.body.newPass;
    let password2 = req.body.confirmNewPass;
    
    if(password1 != password2)
    {
        let err = new Error('Passwords do not match');
        err.statusCode = 400;
        return next(err);
    }
    else
    {
        console.log("Im here password syntax");
        next();
    }
};

exports.verifyNewPasswordSyntax = (req, res, next) =>
{
    let newPass = req.body.newPass
    let confirmNewPass = req.body.confirmNewPass
    
    // 1 lower case, 1 upper case, 1 number, minimum 8 length
    let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    
    if(newPass.match(regex) && confirmNewPass.match(regex))
    {
        console.log("Im here password syntax");
        next();
    }
    else
    {
        let err = new Error('You password syntax is wrong!');
        err.statusCode = 400;
        return next(err);
    }
};

// VERIFY EMAIL SENDING

exports.verifyEmailToken = (req, res, next) => 
{
    passport.authenticate('email_jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {   
            let err = new Error('TOKEN EXPIRED OR CORRUPTED');
            err.statusCode = 403;
            return next(err);
        }
        else
        {
            req.user = user;
            return next();
        }
    
    })(req, res, next); 
};

exports.verifyNewEmail = (req, res, next) =>
{
    console.log(req.body.email);
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null && user.isVerified !== true)
            {
                console.log("User found");
                next();
            }
            else
            {
                let err = new Error('Wrong email or already verified user');
                err.statusCode = 400;
                return next(err);
            }
        })
};

exports.verifyEmailExist = (req, res, next) =>
{
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null)
            {
                console.log("User found");
                req.user = user;
                next();
            }
            else
            {
                let err = new Error('Wrong email');
                err.statusCode = 400;
                return next(err);
            }
        })
};

exports.loginData = (req, res, next) => {
    const loginData = req.body.loginData;
    if(loginData)
        {
            req.body.username = loginData.username;
            req.body.password = loginData.password;
            next();
        }
    else
    {
        let err = new Error('Missing loginData');
        err.statusCode = 400;
        return next(err);
    }
};


// exports.registerLimitter = async(req, res, next) =>
// {
//     try
//     {
//         console.log("test");
//         limitter({
//             windowMs: 5 * 60 * 1000, // 5 minutes in ms
//             max: 2,
//         })
//         next();
//     }
//     catch(err)
//     {
//         res.status(500).json(
//             {
//                 status: false,
//                 err: err.message,
//             });
//     }
//}
const authenticate = require("./authenticate");
const limitter = require('express-rate-limit');

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

const Email_token = function(req) 

{
    var token = null;
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
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
};

exports.verifyAuthorization = async(req, res, next) =>
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
            console.log("AAAA");
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
            var err = new Error('You account has not been verified. Please check your email to verify your account');
            err.status = 403;
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


// VERIFY REGISTER FORM
exports.verifyEmailSyntax = (req, res, next) =>
{
    const valid_email = req.body.email && email_validator.validate(req.body.email);
    
    if(valid_email === true)
    {
        console.log("Im here email syntax");
        next();
    }
    else
    {
        var err = new Error('You Email syntax is wrong!');
        err.status = 400;
        return next(err);
    }

}

exports.verifyPasswordSyntax = (req, res, next) =>
{
    if(req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/))
    {
        console.log("Im here password syntax");
        next();
    }
    else
    {
        var err = new Error('You password syntax is wrong!');
        err.status = 400;
        return next(err);
    }
}

exports.verifyUsername = (req, res, next) =>
{
    User.findOne({username: req.body.username}, (err, user) =>
        {
            if(user !== null)
            {
                var err = new Error('An account with your username already exists!');
                err.status = 400;
                return next(err);
            }
            else
            {
                console.log("Im here username");
                next();
            }
        })
}

exports.verifyEmail = (req, res, next) =>
{
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null)
            {
                var err = new Error('An account with your email already exists!');
                err.status = 400;
                return next(err);
            }
            else
            {
                console.log("Im here email");
                next();
            }
        })
}

exports.verifyPasswordEquality = (req, res, next) =>
{
    var password1 = req.body.password1;
    var password2 = req.body.password2;
    
    if(password1 != password2)
    {
        var err = new Error('Passwords do not match');
        err.status = 400;
        return next(err);
    }
    else
    {
        next();
    }
}

exports.verifyPasswordsSyntax = (req, res, next) =>
{
    var newPass = req.body.newPass
    var confirmNewPass = req.body.confirmNewPass
    
    // 1 lower case, 1 upper case, 1 number, minimum 8 length
    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

    if(newPass.match(regex) && confirmNewPass.match(regex))
    {
        console.log("Im here password syntax");
        next();
    }
    else
    {
        var err = new Error('You password syntax is wrong!');
        err.status = 400;
        return next(err);
    }
}

// VERIFY EMAIL SENDING

exports.verifyEmailToken = (req, res, next) => 
{
    passport.authenticate('email_jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {   
            var err = new Error('TOKEN EXPIRED OR CORRUPTED');
            err.status = 403;
            return next(err);
        }
        else
        {
            req.user = user;
            return next();
        }

    })(req, res, next); 
}

exports.verifyNewEmail = (req, res, next) =>
{
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null && user.isVerified !== true)
            {
                console.log("User found");
                next();
            }
            else
            {
                var err = new Error('Wrong email or already verified account');
                err.status = 400;
                return next(err);
            }
        })
}

exports.verifyResetAttempts = (req, res, next) =>
{
    console.log(options.limitAttempts);
    // User.findOne({email: req.body.email}, (err, user) =>
    //     {
    //         if(user !== null)
    //         {
    //             console.log("User found");
    //             next();
    //         }
    //         else
    //         {
    //             var err = new Error('Wrong email');
    //             err.status = 400;
    //             return next(err);
    //         }
    //     })
}

exports.registerLimitter = async(req, res, next) =>
{
    try
    {
        limitter({
            windowMs: 5 * 60 * 1000, // 5 minutes in ms
            max: 2,
        })
        next();
    }
    catch(err)
    {
        res.status(500).json(
            {
                status: false,
                err: err.message,
            });
    }
    
    
}
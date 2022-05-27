const authenticate = require("./authController");

const express = require('express');
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const User = require('../../models/User');
const email_validator = require("email-validator");
const {nanoid} = require("nanoid");

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

const opts_query = {}; //json web token and key
opts_query.jwtFromRequest = ExtractJwt.fromUrlQueryParameter("accessToken");
opts_query.secretOrKey = process.env.JWT_SEC;

exports.jwtPassport = passport.use("jwt_query", new JwtStrategy(opts_query, (jwtPayload, done) =>
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

const opts_tfa = {}; //json web token and key
opts_tfa.jwtFromRequest = ExtractJwt.fromHeader("twofa_token");
opts_tfa.secretOrKey = process.env.REF_TFA_TOKEN;

exports.TwoFAjwtPassport = passport.use("tfa_jwt", new JwtStrategy(opts_tfa, (jwtPayload, done) =>
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

const opts_new_tfa = {}; //json web token and key
opts_new_tfa.jwtFromRequest = ExtractJwt.fromHeader("new_twofa_token");
opts_new_tfa.secretOrKey = process.env.NEW_TFA_TOKEN;

exports.NewTwoFAjwtPassport = passport.use("new_tfa_jwt", new JwtStrategy(opts_new_tfa, (jwtPayload, done) =>
{
    let TFASecret = jwtPayload.TFASecret;
    User.findOne({_id: jwtPayload._id}, (err, user) =>
        {                
            if(err)
            {
                return done(err, false, null);
            }
            else if(user)
            {
                return done(null, user, TFASecret);
            }
            else
            {
                return done(null, false, null);
            }
        })
}));

const opts_google = {};
opts_google.clientID = process.env.GOOGLE_CLIENT_ID;
opts_google.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
opts_google.callbackURL = `${process.env.OAUTH_ADDRESS}v1/auth/google/callback`;

exports.GooglePassport = passport.use("google", new GoogleStrategy(opts_google, 
    (accessToken, refreshToken, profile, done) =>
    {
        User.findOne({ email: profile?.emails[0]?.value, provider: profile.provider}, (err, user) =>
        {
            if(err)
            {
                return done(err, false, false);
            }
            else if(user)
            {
                return done(null, user, false);
            }
            else
            {
                return done(null, false, profile);
            }
        })
    }
))

const opts_facebook = {};
opts_facebook.clientID = process.env.FACEBOOK_APP_ID;
opts_facebook.clientSecret = process.env.FACEBOOK_APP_SECRET;
opts_facebook.callbackURL = `${process.env.OAUTH_ADDRESS}v1/auth/facebook/callback`;
opts_facebook.profileFields = ['emails', 'name','displayName','photos'];

exports.FacebookPassport = passport.use("facebook", new FacebookStrategy(opts_facebook, 
    (accessToken, refreshToken, profile, done) =>
    {        
        let picture = profile?.photos[0]?.value ? `https://graph.facebook.com/${profile.id}/picture?width=200&height=200`+ "&access_token=" + accessToken : null;
        profile.photos[0].value = picture ? picture : 'PrPhdefaultAvatar.jpg';
        
        User.findOne({ email: profile?.emails[0]?.value, provider: profile.provider}, (err, user) =>
        {
            if(err)
            {
                return done(err, false, false);
            }
            else if(user)
            {
                return done(null, user, false);
            }
            else
            {
                return done(null, false, profile);
            }
        })
    }
))

const opts_github = {};
opts_github.clientID = process.env.GITHUB_CLIENT_ID;
opts_github.clientSecret = process.env.GITHUB_CLIENT_SECRET;
opts_github.callbackURL = `${process.env.OAUTH_ADDRESS}v1/auth/github/callback`;
opts_github.scope = ['user:email'];

exports.GithubPassport = passport.use("github", new GitHubStrategy(opts_github, 
    (accessToken, refreshToken, profile, done) =>
    {        
        User.findOne({ email: profile?.emails[0]?.value, provider: profile.provider}, (err, user) =>
        {
            if(err)
            {
                return done(err, false, false);
            }
            else if(user)
            {
                return done(null, user, false);
            }
            else
            {
                return done(null, false, profile);
            }
        })
    }
))

// VERIFY GOOGLE USER
exports.verifyProviderUser = async(req, res, next) =>
{
    try
    {
        let provider, scope;
        
        req.url.includes('google') 
        ? provider = "google" 
        : req.url.includes('facebook') 
        ? provider = "facebook" 
        : provider = "github";
        
        req.url.includes('google') 
        ? scope = [ 'email', 'profile' ]
        : req.url.includes('facebook') 
        ? scope = [ 'email']
        : scope = [ 'user:email'];
        
        
        passport.authenticate(provider, 
        { 
            session: false,
            scope: scope
        }, async(err, user, profile) => 
        {            
            if(err) {return next(err);}
            else if(!user)
            {
                let email;
                
                provider === "github" 
                ? username = profile.username
                : !profile.name.familyName 
                ? username = profile.name.givenName
                : username = profile.name.givenName + "_" + profile.name.familyName
                
                const usernameExist = await User.findOne({ username : username});
                
                usernameExist && (username = "user" + nanoid(8))
                
                !profile?.emails[0]?.value 
                ? email = "error"
                : email = profile.emails[0].value;
                
                if(email === "error")
                {
                    let err = new Error('Cannot access to your email address!');
                    err.statusCode = 500;
                    return next(err);
                }
                
                user =  await new User(
                    {
                        username: username, 
                        isVerified: true,
                        avatar: profile.photos[0].value,
                        email:  email,
                        provider: provider,
                    })
                
                user.save((err) => 
                {
                    if(err)
                    {
                        res.redirect(process.env.SERVER_ADDRESS + 
                            '?status=failed' +
                            '&message='+ err.message +
                            '&statusCode=500'
                            )
                    }
                    else
                    {
                        const accessToken = authenticate.GenerateAccessToken({_id: user._id});                            
                        
                        res.redirect(process.env.SERVER_ADDRESS + 
                            '?status=successRegistration' + 
                            '&message=Registration successfull!'+
                            '&accessToken=' + accessToken + 
                            '&statusCode=201'
                            )
                    }
                })
            }
            else if(user)
            {
                
                req.login(user, { session: false }, async(err) => 
                {
                    if(err)
                    {
                        res.redirect(process.env.SERVER_ADDRESS + 
                            '?status=failed' +
                            '&message=Login Unsuccessfull!'+
                            '&statusCode=500'
                            )
                    }
                    else
                    {
                        const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});                            
                        
                        res.redirect(process.env.SERVER_ADDRESS + 
                            '?status=successLogin' + 
                            '&accessToken=' + accessToken + 
                            '&statusCode=200'
                        )
                    }
                })
                

                //     res.redirect(process.env.SERVER_ADDRESS + 
                //         '?status=failed' +
                //         '&message=An account with your mail address already exists without '+
                //         provider +
                //         ' please login with your Nutritiv account' +
                //         '&statusCode=400' +
                //         '&username=' + user.username
                //         )
            }
        })(req, res, next);
    }catch(err)
    {
        res.redirect(process.env.SERVER_ADDRESS + 
            '?status=failed' +
            '/?message=Registration Failed! Please try again later!'+
            '/?statusCode=500'
            )
    }
}

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
        if( userId === req.params.id || req.user.isAdmin === true || userId === req.params.userId)
        {
            next();
        }
        else
        {
            let err = new Error('You are not authorized to perform this operation!');
            err.statusCode = 403;
            return next(err);
        }
    }catch(err){next(err)}
};

exports.verifyUserTFA = async(req, res, next) =>
{
    passport.authenticate("tfa_jwt", { session: false }, (err, user, info) => 
    {
        if(err)
        {
            return next(err);
        }
        else if (!user) 
        {               
            let err = new Error('You are not authorized to perform this operation!');
            err.statusCode = 401;
            return next(err);
        }
        else if (user.isVerified === false)
        {
            let err = new Error('You account has not been verified. Please check your email to verify your account');
            err.statusCode = 401;
            return next(err);
        }
        else
        {
            req.user = user;
            return next();
        }
    })(req, res, next); 
}

exports.verifyUserNewTFA = async(req, res, next) =>
{
    passport.authenticate("new_tfa_jwt", { session: false }, (err, user, TFASecret) => 
    {
        if(err)
        {
            return next(err);
        }
        else if (!user) 
        {               
            let err = new Error('You are not authorized to perform this operation!');
            err.statusCode = 401;
            return next(err);
        }
        else if (user.isVerified === false)
        {
            let err = new Error('You account has not been verified. Please check your email to verify your account');
            err.statusCode = 401;
            return next(err);
        }
        else
        {
            req.user = user;
            req.TFASecret = TFASecret;
            return next();
        }
    })(req, res, next); 
}

exports.verifyUser = (req, res, next) => 
{
    passport.authenticate('jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {               
            req.statusCode = 401;
            req.user = "error";
            return next();
        }
        else if (user.isVerified === false)
        {
            let err = new Error('You account has not been verified. Please check your email to verify your account');
            err.statusCode = 401;
            return next(err);
        }
        else
        {
            req.user = user;
            return next();
        }
    })(req, res, next); 
};

exports.verifyUserQuery = (req, res, next) => 
{
    passport.authenticate('jwt_query', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {               
            req.statusCode = 401;
            req.user = "error";
            return next();
        }
        else if (user.isVerified === false)
        {
            let err = new Error('You account has not been verified. Please check your email to verify your account');
            err.statusCode = 401;
            return next(err);
        }
        else
        {
            req.user = user;
            return next();
        }
    })(req, res, next); 
};

exports.verifyUserCart = (req, res, next) => 
{
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {
            return next();
        }
        else if (user.isVerified === false)
        {
            let err = new Error('You account has not been verified. Please check your email to verify your account');
            err.statusCode = 401;
            return next(err);
        }
        else
        {
            req.user = user;
            return next();
        }
    })(req, res, next); 
};

exports.verifyRefresh = (req, res, next) => 
{
    if(req.user === "error" || req.user === "emptyCart")
    {
        passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
        {        
            if (err || !user) 
            {
                return res.status(req.statusCode).json(
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
                    // .cookie("refresh_token", refreshToken, 
                    //     {
                    //         httpOnly: true,
                    //         secure: process.env.REF_JWT_SEC_COOKIE === "prod"
                    //         //sameSite: "Lax"
                    //     })
                
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
    else return next();
};

exports.verifyNoRefresh = (req, res, next) => 
{
    passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
    {        
        if (err || !user) return next();
        else
        {
            let err = new Error('You are already connected!');
            err.statusCode = 401;
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

exports.Generate2AFToken = function(_id) 
{
    return jwt.sign
    (
        _id, 
        process.env.REF_2AF_TOKEN, 
        {expiresIn: "120s"} // expires in 2 minutes
    );
};

exports.GenerateNewTFAToken = function(_id, TFASecret) 
{
    return jwt.sign
    (
        {_id, TFASecret},  
        process.env.NEW_TFA_TOKEN, 
        {expiresIn: "1800s"} // expires in 2 minutes
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
    const valid_email = req.body.email && email_validator.validate(req.body.email);
    if(valid_email === true) next();
    else
    {
        let err = new Error('Your Email syntax is wrong!');
        err.statusCode = 400;
        next(err);
    }
};

exports.verifyPasswordSyntax = (req, res, next) =>
{
    if(req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) // password 8 characters, 1 low 1 upper 1 number
    {next();}
    else
    {
        let err = new Error('Your password syntax is wrong!');
        err.statusCode = 400;
        next(err);
    }
};

exports.verifyUsername = (req, res, next) =>
{
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    console.log(format.test(req.body.username));
    if(!format.test(req.body.username))
    {
        User.findOne({username: req.body.username}, (err, user) =>
        {
            if(user !== null)
            {
                let err = new Error('An account with your username already exists!');
                err.statusCode = 400;
                return next(err);
            }
            else
            {
                next();
            }
        })
    }
    else
    {
        let err = new Error('Your username syntax is wrong!');
        err.statusCode = 400;
        next(err);
    }
    
};

exports.verifyEmail = (req, res, next) =>
{
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null)
            {
                let err = new Error('An account with your email already exists!');
                err.statusCode = 400;
                return next(err);
            }
            else
            {
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
        next(err);
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
    
    if(newPass.match(regex) && confirmNewPass.match(regex)) return next()
    
    let err = new Error('You password syntax is wrong!');
    err.statusCode = 400;
    next(err);
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

exports.userVerification = async(req, res, next) =>
{
    const user = req.user;
    try
    {
        user.isVerified = true;
        await user.save(() => 
                {
                    next();
                })
    }catch(err){next(err)}
}
exports.verifyNewEmail = (req, res, next) =>
{
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null && user.isVerified !== true)
            {
                return next();
            }
            else if(user.isVerified)
            {
                let err = new Error('Already verified user');
                err.statusCode = 403;
                return next(err);
            }
            else
            {
                let err = new Error('Wrong email');
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
                req.user = user;
                next();
            }
            else
            {
                err.statusCode = 400;
                return next(err);
            }
        })
};

// exports.loginData = (req, res, next) => 
// {
//     const loginData = req.body.loginData;
//     if(loginData)
//     {
//         req.body.username = loginData.username;
//         req.body.password = loginData.password;
//         next();
//     }
//     else
//     {
//         let err = new Error('Missing loginData');
//         err.statusCode = 400;
//         return next(err);
//     }
    
// };


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
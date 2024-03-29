const authenticate = require("./authController");
const express = require('express');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config(); // INITIALIZE ENVIRONNEMENT VARIABLE FILE ".env"

const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const User = require('../../models/User');
const email_validator = require("email-validator");
const { customAlphabet } = require('nanoid');
const alphabet = process.env.ALPHABET;
const nanoid = customAlphabet(alphabet, 12);
const fetch = require("node-fetch");
const speakeasy = require("speakeasy");

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

// const cookieExtractor = function(req) 
// {
//     let token = null;
//     if (req && req.cookies) token = req.cookies['refreshToken'];
//     return token;
// };

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
    if (req && req.query) token = req.query?.token;
    return token;
};

const opts_email = {}; //json web token and key
opts_email.jwtFromRequest = Email_token;
opts_email.secretOrKey = process.env.JWT_EMAIL;

exports.jwtPassport = passport.use("email_jwt", new JwtStrategy(opts_email, (jwtPayload, done) =>
{
    User.findOne({email: jwtPayload.email, provider: "local", updatedAt: new Date(jwtPayload.updatedAt)}, (err, user) =>
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
                return done(null, false, TFASecret);
            }
        })
}));

const opts_google = 
{
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : `${process.env.OAUTH_ADDRESS}v1/auth/google/callback`
}

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
));

const opts_facebook = 
{
    clientID : process.env.FACEBOOK_APP_ID,
    clientSecret : process.env.FACEBOOK_APP_SECRET,
    callbackURL : `${process.env.OAUTH_ADDRESS}v1/auth/facebook/callback`,
    profileFields : ['emails', 'name','displayName','photos']
}

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
));

const opts_github = 
{
    clientID : process.env.GITHUB_CLIENT_ID,
    clientSecret : process.env.GITHUB_CLIENT_SECRET,
    callbackURL : `${process.env.OAUTH_ADDRESS}v1/auth/github/callback`,
    scope : ['user:email']
}

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
));

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
                let email, username;
                
                provider === "github" 
                ? username = profile.username
                : !profile.name.familyName 
                ? username = profile.name.givenName
                : username = profile.name.givenName + "_" + profile.name.familyName
                
                const usernameExist = await User.findOne({ username : username});
                
                usernameExist && (username = "user" + nanoid())
                
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
                        const oAuthToken = authenticate.GenerateAccessToken({_id: user._id});                            
                        
                        res.redirect(process.env.SERVER_ADDRESS + 
                            '?status=successRegistration' + 
                            '&message=Registration successfull!'+
                            '&oAuthToken=' + oAuthToken + 
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
                        const oAuthToken = authenticate.GenerateAccessToken({_id: req.user._id});                            
                        
                        res.redirect(process.env.SERVER_ADDRESS + 
                            '?status=successLogin' + 
                            '&oAuthToken=' + oAuthToken + 
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
};

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
};

exports.verifyUserTFARecovery = async(req, res, next) =>
{
    passport.authenticate("tfa_jwt", { session: false }, (err, user, info) => 
    {
        if(err || !user)
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
        }
        // else if (!user) 
        // {               
        //     let err = new Error('You are not authorized to perform this operation!');
        //     err.statusCode = 401;
        //     return next(err);
        // }
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

exports.verifyUserNewTFA = async(req, res, next) =>
{
    passport.authenticate("new_tfa_jwt", { session: false }, (err, user, TFASecret) => 
    {
        
        if(err || !user)
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
};

exports.verifyUser = (req, res, next) => 
{
    passport.authenticate('jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user)
        {               
            console.log(`req.headers = `, req.headers)
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
            req.user = "error";
            req.cart = "cart_not_found";
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
    if(req.user === "error")
    {        
        passport.authenticate('jwt_rt', { session: false }, (err, user, info) => 
        {        
            if (err || !user && req.cart === "cart_not_found") 
            {
                req.user = null;
                return next();
            }
            else if(err || !user)
            {
                console.log(info);
                return res.status(req.statusCode).json(
                    {
                        success: false, 
                        status: "You are not connected", 
                        err: "No refreshToken found or its not valid",
                    });
            }
            else if(req.cart === "cart_not_found")
            {
                req.user = user;
                return next();
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
                return next();
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

exports.GenerateTFAToken = function(_id) 
{
    return jwt.sign
    (
        _id, 
        process.env.REF_TFA_TOKEN, 
        {expiresIn: "120s"} // expires in 2 minutes
    );
};

exports.GenerateNewTFAToken = function(_id, TFASecret) 
{
    return jwt.sign
    (
        {_id, TFASecret},  
        process.env.NEW_TFA_TOKEN, 
        {expiresIn: "3600s"} // expires in 30 minutes
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

exports.GenerateEmailToken = function(email, updatedAt) 
{
    return jwt.sign
    (
        {email, updatedAt}, 
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
    let password = req.body.password;

    if(typeof password === 'string' && password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) // password 8 characters, 1 low 1 upper 1 number
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
        next();
    }
};

exports.verifyNewPasswordSyntax = (req, res, next) =>
{
    let newPass = req.body.newPass
    let confirmNewPass = req.body.confirmNewPass
    
    // 1 lower case, 1 upper case, 1 number, minimum 8 length
    let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    
    if(newPass.match(regex) && confirmNewPass.match(regex) 
    && typeof confirmNewPass === 'string' && typeof newPass === 'string') return next()
    
    let err = new Error('You password syntax is wrong!');
    err.statusCode = 400;
    next(err);
};

exports.verifyCaptcha = async(req, res, next) => 
{
    try
    {
        if(process.env.POSTMAN === false)
        {
            if(!req.body.captcha)
            {
                let err = new Error('Please select captcha');
                err.statusCode = 400;
                return next(err);
            }
            
            let secretKey = process.env.RECAPTCHA_KEY;
            let verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`
        
            // deepcode ignore Ssrf: <please specify a reason of ignoring this>
            let response = await fetch(verifyUrl,{method : 'POST'});
            let body = await response.json();
            
            console.log(`body.score = `, body.score)
            
            if(!body.success || body.score < 0.5)
            {
                let err = new Error('Your might be a robot, you are banned!');
                err.statusCode = 400;
                return next(err);
            }
        }
        
        next();
        
    
    }catch(err){next(err)}
};

// VERIFY EMAIL SENDING
exports.verifyEmailToken = (req, res, next) => 
{
    passport.authenticate('email_jwt', { session: false }, (err, user, info) => 
    {
        if (err || !user) 
        {   
            // let err = new Error('TOKEN EXPIRED OR CORRUPTED');
            // err.statusCode = 403;
            // return next(err);

            return res.redirect(process.env.SERVER_ADDRESS + 
                'reset-password/'+
                '?status=pwdFailed' 
                // '&message=forgetPasswordURLVerified'+
                // '&statusCode=200'
                )
        }
        else
        {
            req.user = user;
            return next();
        }
    })(req, res, next); 
};

// VERIFY EMAIL SENDING
exports.verifyNewUserEmail = (req, res, next) => 
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
};

exports.verifyNewEmail = (req, res, next) =>
{
    User.findOne({email: req.body.email}, (err, user) =>
        {
            if(user !== null && user.isVerified !== true)
            {
                req.user = user;
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

exports.verifyEmailExist = async(req, res, next) =>
{
    try
    {
        const user = await User.findOne({email: req.body?.email, provider : "local"})

            
        if(user)
        {
            req.user = user;
            next();
        }
        else
        {
            let err = new Error('This email do not refer to a registered account!')
            err.statusCode = 400;
            next(err);
        }

    }catch(err){next(err)}
};

exports.createTFARecovery = async(req, res, next) =>
{
    if(req.user.TFASecret && req.user.TFARecovery)
        {
            const TFARecoveryInitial = req.user.TFARecovery;
            const TFARecoveryEntered = req.body.TFARecovery;
            
            if(JSON.stringify(TFARecoveryInitial) == JSON.stringify(TFARecoveryEntered))
            {
                const TFASecret = req.user.TFASecret;
                const otpAuthURL = `otpauth://totp/Nutritiv(${req.user.username})?secret=${TFASecret}`
                const twoFAToken = authenticate.GenerateNewTFAToken(req.user._id, TFASecret);
                
                req.twoFAToken = twoFAToken;
                req.otpAuthURL = otpAuthURL;
                req.TFASecret = TFASecret;
                next();
            }
            else
            {
                res.status(401).json(
                    {
                        success: false,
                        status: "Your recovery sentence is false!"
                    })
            }
        }
        else
        {
            res.status(400).json(
                {
                    success: false,
                    status: "Your account do not have TFA enabled!"
                })
        }
};

exports.createTFASecret = async(req, res, next) =>
{
    try
    {
        if(!req.user.TFASecret)
        {
            const TFASecret = speakeasy.generateSecret(
                {
                    name: `Nutritiv(${req.user.username})`,
                    length: 10
                })
            
            const TFASecretBase32 = TFASecret.base32;
            const twoFAToken = authenticate.GenerateNewTFAToken(req.user._id, TFASecretBase32);
            const otpAuthURL = TFASecret.otpauth_url;
            
            req.twoFAToken = twoFAToken;
            req.otpAuthURL = otpAuthURL;
            req.TFASecretBase32 = TFASecretBase32;
            next();
        }
        else
        {
            res.status(400).json(
                {
                    success: false,
                    status: "Your account already have TFA enabled!"
                })
        }
    }catch(err){next(err)}
};

exports.disableTFA = async(req, res, next) =>
{
    try
    {
        let user = req.user, password = req.body.password;
        if(user.TFASecret)
        {
            user.authenticate(password, async (err, user) => 
                {
                    if(err)
                    {
                        err.statusCode = 400;
                        next(err);
                    }
                    else if(!user)
                    {
                        let err = new Error('Password is incorrect!');
                        err.statusCode = 400;
                        next(err);
                    }
                    else
                    {                        
                        const TFASecret = user.TFASecret.toString();
                        const token = req.body.code;
                        
                        const valid = speakeasy.totp.verify(
                            {
                                secret: TFASecret,
                                encoding: 'base32',
                                token: token,
                                window: 0
                            });
                            
                            if(valid === true)
                            {
                                const user = await User.findOneAndUpdate({_id: req.user._id},
                                    {
                                        $unset: {"TFASecret": "", "TFARecovery": ""}
                                    });
                                await user.save();
                                next();
                            }
                            else
                            {
                                let err = new Error('The code is invalid or expired!');
                                err.statusCode = 401;
                                return next(err);
                            }
                    }
                })
        }
        else
        {
            res.status(400).json(
                {
                    success: true,
                    status: "Your account do not have enable TFA"
                })
        }
    }catch(err){next(err)}
};

exports.enableTFA = async(req, res, next) =>
{
    try
    {
        let user = req.user, password = req.body.password;
        
        // if(!user.TFASecret)
        // {
            user.authenticate(password, async (err, user) => 
                {
                    if(err)
                    {
                        err.statusCode = 400;
                        next(err);
                    }
                    else if(!user)
                    {
                        let err = new Error('Password is incorrect!');
                        err.statusCode = 400;
                        next(err);
                    }
                    else
                    {

                        const TFASecret = req.TFASecret.toString();
                        const token = req.body.code;
                        const valid = speakeasy.totp.verify(
                            {
                                secret: TFASecret,
                                encoding: 'base32',
                                token: token,
                                window: 0
                            });
                            
                            if(valid === true)
                            {
                                let TFARecovery = [];
        
                                for(let i = 0; i < 12; i++){TFARecovery.push(randomWords())}
                                                                
                                const user = await User.findOneAndUpdate({_id: req.user._id},
                                    {
                                        $set:
                                        {
                                            "TFASecret": TFASecret,
                                            "TFARecovery": TFARecovery
                                        }
                                    })
                                await user.save();
                                req.TFARecovery = TFARecovery;
                                next();
                            }
                            else
                            {
                                let err = new Error('The code is invalid or expired!');
                                err.statusCode = 401;
                                return next(err);
                            }
                    }
                })
        // }
        // else
        // {
        //     res.status(400).json(
        //         {
        //             success: true,
        //             status: "Your account already have enabled TFA!"
        //         })
        // }
    }catch(err){next(err)}
};

exports.TFAValidation = async(req, res, next) =>
{
    try
    {
        const user = await User.findOne({_id: req.user._id});

        const TFASecret = user.TFASecret.toString();
        const token = req.body.code;
        
        const valid = speakeasy.totp.verify(
            {
                secret: TFASecret,
                encoding: 'base32',
                token: token,
                window: 0
            }
        )

        if(valid === true)
        {
            req.login(user, { session: false }, async(err) => 
            {
                if(err)
                {
                    res.status(400).json(
                        {
                            success: false, 
                            status: 'Login Unsuccessful!', 
                            err: err
                        });
                }
                else
                {
                    const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});
                    const refreshToken = authenticate.GenerateRefreshToken({_id: req.user._id});
                    
                    req.accessToken = accessToken;
                    req.refreshToken = refreshToken;
                    next();
                }
            });
        }
        else
        {
            let err = new Error('The code is invalid or expired!');
            err.statusCode = 401;
            return next(err);
        }
    
    }catch(err){next(err)}
};

exports.login = async(req, res, next) =>
{
    try
    {
        passport.authenticate('local', { session: false }, (err, user, info) => 
        {
            if(err || !user) 
            {
                
                res.status(400).json(
                    {
                        success: false, 
                        status: 'Login Unsuccessful!', 
                        err: err,
                        info: info
                    });
            }
            else if(user.isVerified === false)
            {
                let err = new Error('Your account is not verified!');
                err.statusCode = 400;
                return next(err);
            }
            else
            {
                req.login(user, { session: false }, async(err) => 
                {
                    if(err)
                    {
                        res.status(400).json(
                            {
                                success: false, 
                                status: 'Login Unsuccessful!', 
                                err: err
                            });
                    }
                    else if(user.TFASecret)
                    {
                        const twoFAToken = authenticate.GenerateTFAToken({_id: user._id});

                        res.header('twofa_token', twoFAToken)
                            .status(200).json(
                            {
                                success: true, 
                                hasTFA: true // refirect to /TFAValidation
                            })
                    }
                    else
                    {
                        const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});
                        const refreshToken = authenticate.GenerateRefreshToken({_id: req.user._id});
                        
                        req.accessToken = accessToken;
                        req.refreshToken = refreshToken;
                        next();
                    }
                })
            };
        })(req, res, next);
    }catch(err){next(err)}
};

exports.register = async(req, res, next) =>
{
    try
    {
        User.register(new User({username: req.body.username, email: req.body.email}), 
        req.body.password, async(err, user) =>
        {
            if(err)
            {
                return res.status(500).json(
                    {
                        success: false, 
                        status: 'Registration Failed! Please try again later!', 
                        err: err
                    });
            } 
            else 
            {
                await user.save(async() => 
                {
                    req.updatedAt = user.updatedAt;
                    return next();
                })
            }
        });
    }catch(err){next(err)}
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
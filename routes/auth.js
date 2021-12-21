const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");
const email_validator = require("email-validator");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

// MIDDLEWARES
const cors = require('../middleware/cors');
const authenticate = require("../middleware/authenticate");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

//REGISTER
router.post("/register", (req, res) =>
{
    if(req.body.email)
    {
        const valid_email = email_validator.validate(req.body.email);

        if(valid_email == true)
        {}
        else
        {
            return res.status(400).json(
                {success: false, status: 'Registration Unsuccessful!', err: "Wrong email syntax"});
        }
    }

    if(req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/))
    {}

    else
    {
        return res.status(400).json(
            {success: false, status: 'Registration Unsuccessful!', err: "Wrong password syntax"});
    }
    
    User.register(new User(
        {username: req.body.username, email: req.body.email, emailToken: crypto.randomBytes(64).toString("hex")}), 
        req.body.password, async(err, user) =>
    {
        try
        {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            
            const msg = 
            {
                to: user.email,
                from:"nutritivshop@gmail.com",
                subject:"Nutritiv - Account email verification",
                html : `
                <h1>Hello, </h1>
                <p>Thanks for registering on our website.</p>
                <p>Please click on the link below to verify your account</p>
                <a  href="http://${req.headers.Host}/verify-email?token${user.emailToken}">Verify your account</a>`
            }
            console.log(req.headers.Host);
            
            await sgMail.send(msg);
            
            await user.save(() => 
            {
                res.status(201).json(
                    {success: true, status: 'Registration Successful! Check your emails'});
            })
        }
        catch(error)
        {
            res.status(400).json(
                {success: false, status: 'Registration Unsuccessful!', err: error, err: err});
        }
    });
});

//FORGOT PASSWORD
router.get("/verify-email", cors.cors, async(req, res, next) =>
{
    try
    {
        res.redirect('/api/auth/login');
        const user = await User.findOne({ emailToken: req.body.token}); //req.query.token 
        if(!user)
        {
            res.status(400).json(
                {success: false, status: 'Token is invalid, Please contact us for assistance. ', err: err.message});
        }
        user.emailToken = null;
        user.isVerified = true;

        await user.save();
        
        res.status(200).json(
            {
                success: true, 
                status: 'Account validation successfull!, pls connect to your account'
            });
        }
    catch(err)
        {
            res.status(400).json(
                {success: false, status: 'Unsuccessfull request', err: err.message});
        }
    
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
                    info: info.message
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
                            err: err.message
                        });
                }
                
                const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});
                const refreshToken = authenticate.GenerateRefreshToken({_id: req.user._id});
                
                res
                .header('Authorization', 'Bearer '+ accessToken)
                .cookie("refreshToken", refreshToken, 
                    {
                        httpOnly: true,
                        secure: process.env.REF_JWT_SEC_COOKIE === "prod"
                        //sameSite: "Lax"
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

// CLEAR COOKIE TOKEN // LOGOUT
router.get("/logout", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, async(req, res) =>
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

// REFRESH TOKEN
// router.post("/token", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, async(req, res) =>
// {   
//     try
//     {
//         // Generate new accessToken
//         const accessToken = authenticate.GenerateAccessToken({_id: req.user._id});
        
//         res.status(200).json(
//             {
//                 success: true, 
//                 accessToken: accessToken
//             });
//     }
//     catch(err)
//     {
//         res.status(500).json(
//             {
//                 success: false, 
//                 status: 'Access Token Generation Unsuccessful!', 
//                 err: err.message,
//             });
//     }
// });
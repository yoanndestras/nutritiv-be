const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require("../controllers/authenticate");
const mailer = require("../controllers/mailer");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

//REGISTER
router.post("/register", auth.verifyUsername, auth.verifyEmail, auth.verifyEmailSyntax, 
auth.verifyPasswordSyntax, mailer.sendVerifyAccountMail, async(req, res) =>
{
    try
    {
        User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, async(err, user) =>
        {
            if(err) 
            {
                console.log(err);
                return res.status(400).json(
                    {
                        success: false, 
                        status: 'Registration Failed! Please try again later!', 
                        err: err
                    });
            } 
            else 
            {
                await user.save(() => 
                {
                    console.log("User registered");
                    res.status(201).json(
                        {
                            success: true, 
                            status: 'Registration Successfull! Check your emails!'
                        });
                })
            }
        });
    }
    catch(err)
    {
        console.log("User not registered ");
        res.status(400).json(
            {
                success: false, 
                status: 'Registration Failed! Please try again later!', 
                err: err
            });
    }
});

//FORGOT PASSWORD
router.get("/verify-email", cors.cors, auth.verifyEmailToken, async(req, res, next) =>
{
    const user = req.user;
    try
    {
        user.isVerified = true;
        await user.save(() => 
                {
                    console.log("User Verified");
                    res.status(201).json(
                        {
                            success: true, 
                            status: 'User Verification Successfull!'
                        });
                })
    }
    catch(err)
        {
            res.status(400).json(
            {
                success: false, 
                status: 'Unsuccessfull request!', 
                err: err
            });
        }
});

//GENERATE NEW EMAIL TOKEN
router.get("/new_email_token", cors.cors, auth.verifyNewEmail, mailer.sendVerifyAccountMail, async(req, res, next) =>
{
    try
    {
        console.log("New email link sent");
        res.status(201).json(
            {
                success: true, 
                status: 'Check your emails!'
            });
    }
    catch(err)
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err
                });
        }
});


//FORGET PASSWORD EMAIL
router.get("/password_email", cors.cors, auth.verifyEmailExist, mailer.sendForgetPassword, async(req, res, next) =>
{
    try
    {   
        res.status(201).json(
            {
                success: true, 
                status: 'Check your emails!!'
            });
    }
    catch(err)
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err.message
                });
        }
});

//VERIFY FORGET PASSWORD EMAIL
router.get("/verify_password_email", cors.cors, auth.verifyEmailToken, async(req, res, next) =>
{
    try
    {
        res.status(201).json(
            {
                success: true, 
                status: 'Email verification successfull!'
            });
    }
    catch(err)
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err.message
                });
        }
});

router.post("/verify_password_email", cors.cors, auth.verifyNewEmail, async(req, res, next) =>
{
    var user = await User.findOne({username: req.body.username});
    user.resetAttempts();
    
    try
    {
        res.status(201).json(
            {
                success: true, 
                status: 'Reset password successfull!'
            });
    }
    catch(err)
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err.message
                });
        }
});





//LOGIN
router.post("/login", cors.corsWithOptions, async(req, res, next)=>
{
    //passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login' }));
    passport.authenticate('local', { session: false }, (err, user, info) => 
    {
        if(err || !user || user.isVerified === false) 
        {
            res.status(401).json(
                {
                    success: false, 
                    status: 'Login Unsuccessful!', 
                    err: err,
                    info: info
                });
        }
        else
        {
            req.login(user, { session: false }, async(err) => 
            {
                if(err)
                {
                    res.status(401).json(
                        {
                            success: false, 
                            status: 'Login Unsuccessful!', 
                            err: err
                        });
                }
                else
                {
                    const accessToken = auth.GenerateAccessToken({_id: req.user._id});
                    const refreshToken = auth.GenerateRefreshToken({_id: req.user._id});
                    
                    res.header('Authorization', 'Bearer '+ accessToken)
                        .cookie("refreshToken", refreshToken, 
                            {
                                httpOnly: true,
                                secure: process.env.REF_JWT_SEC_COOKIE === "production"
                            })
                        .status(200).json(
                            {
                                success: true, 
                                status: 'Login Successful!'
                            });
                }
            })
        };
    })(req, res, next);
});


// CLEAR COOKIE TOKEN // LOGOUT
router.get("/logout", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res) =>
{   
    try
    {
        return  res.clearCookie("refreshToken")
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
                err: err
            });
    }
});

//TEST FRONT
router.post("/data", cors.cors, async(req, res, next) =>
{
    try
    {
        res.status(200).json(
            {
                success: true, 
                data: req.body
            });
    }
    catch(err)
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'Unsuccessfull request!', 
                    err: err.message
                });
        }
});


module.exports = router;

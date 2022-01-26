const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");

// MIDDLEWARES
const cors = require('../controllers/cors');
const auth = require("../controllers/authenticate");
const mailer = require("../controllers/mailer");

//OPTIONS FOR CORS CHECK
// router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

//REGISTER
router.post("/register", auth.verifyUsername, auth.verifyEmail, auth.verifyEmailSyntax, 
auth.verifyPasswordSyntax, mailer.sendVerifyAccountMail, async(req, res) =>
{
    try
    {
        User.register(new User({username: req.body.formData.username, email: req.body.formData.email}), req.body.formData.password, async(err, user) =>
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
router.get("/verify-email", auth.verifyEmailToken, async(req, res, next) =>
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
router.get("/new_register_email", auth.verifyNewEmail, mailer.sendVerifyAccountMail, async(req, res, next) =>
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
router.get("/forget_pwd", auth.verifyEmailExist, mailer.sendForgetPassword, async(req, res, next) =>
{
    try
    {
        res.status(200).json(
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
router.get("/verify_forget_pwd", auth.verifyEmailToken, async(req, res, next) =>
{
    try
    {
        res.status(200).json(
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

//NEW PASSWORD AND RESET LOGIN ATTEMPTS
//auth.verifyEmailToken
router.post("/new_password", auth.verifyNewPasswordSyntax, auth.verifyNewPasswordEquality, async(req, res, next) =>
{
    try
    {
        //const user = req.user.username;
        const user = await User.findOne({username: "yoann"});

        const newPass = req.body.confirmNewPass;
        console.log(newPass);
        
        if(user && newPass)
        {
            await user.resetAttempts();
            await user.setPassword(newPass);
            user.forgetPass = false;
            await user.save();
            
            res.status(201).json(
                {
                    success: true, 
                    status: 'Reset password successfull!'
                });
        }
        else
        {
            res.status(500).json(
                {
                    success: false, 
                    status: 'No user found!', 
                    err: err.message
                });
        }
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
router.post("/login", cors.corsWithOptions, auth.loginData, auth.verifyNoRefresh, async(req, res, next)=>
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
                    
                    
                        res.cookie("refreshToken", refreshToken, 
                            {
                                httpOnly: true,
                                SameSite: none,
                                secure: process.env.REF_JWT_SEC_COOKIE === "production"
                            })
                            .status(200).json(
                                {
                                    success: true, 
                                    status: 'Login Successful!',
                                    accessToken: accessToken,
                                    refreshToken: refreshToken
                                });
                }
            })
        };
    })(req, res, next);
});


// CLEAR COOKIE TOKEN // LOGOUT
router.delete("/logout", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res) =>
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
router.post("/data", async(req, res, next) =>
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

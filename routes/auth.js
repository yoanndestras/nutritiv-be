const router = require("express").Router();
const User = require("../models/User");

// CONTROLLERS

const passport = require("passport");
const cors = require('../controllers/corsController');
const auth = require("../controllers/authController");
const mailer = require("../controllers/mailerController");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

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
    }catch(err){next(err)}
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
    }catch(err){next(err)}
});

//GENERATE NEW EMAIL TOKEN
router.get("/new_register_email", auth.verifyNewEmail, mailer.sendVerifyAccountMail, async(req, res, next) =>
{
    try
    {
        res.status(200).json(
            {
                success: true, 
                status: 'Check your emails!'
            });
    }catch(err){next(err)}
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
                    res.status(200).json(
                        {
                            success: true, 
                            status: 'User Verification Successfull!'
                        });
                })
    }catch(err){next(err)}
});

//REGISTER
router.post("/register", auth.verifyUsername, auth.verifyEmail, auth.verifyEmailSyntax, 
auth.verifyPasswordSyntax, mailer.sendVerifyAccountMail, async(req, res, next) =>
{
    try
    {
        User.register(new User({username: req.body.formData.username, email: req.body.formData.email}), 
        req.body.formData.password, async(err, user) =>
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
                await user.save(() => 
                {
                    res.status(201).json(
                        {
                            success: true, 
                            status: 'Registration Successfull! Check your emails!'
                        });
                })
            }
        });
    }catch(err){next(err)}
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
    }catch(err){next(err)}
});


//LOGIN
router.post("/login", cors.corsWithOptions, auth.loginData, auth.verifyNoRefresh, async(req, res, next)=>
{
    try
    {
        //passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login' }));
        passport.authenticate('local', { session: false }, (err, user, info) => 
        {
            
            if(err || !user || user.isVerified === false) 
            {
                res.status(400).json(
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
                        res.status(400).json(
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
                        
                        res.header('access_token', accessToken)
                            .header('refresh_token', refreshToken)
                            .cookie("refresh_token", refreshToken, 
                            {
                                httpOnly: true,
                                secure: process.env.REF_JWT_SEC_COOKIE === "production"
                            })
                            .status(200).json(
                                {
                                    success: true,
                                    loggedIn: true,
                                    isAdmin: req.user.isAdmin,
                                    status: 'Login Successful!'
                                });
                    }
                })
            };
        })(req, res, next);
    }catch(err){next(err)}
});


// CLEAR COOKIE TOKEN // LOGOUT
router.delete("/logout", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res, next) =>
{   
    try
    {
        return  res.clearCookie("refresh_token")
                    .status(200)
                    .json(
                        {
                            success: true, 
                            loggedIn: false,
                            status: "Successfully logged out!"
                        });
    }catch(err){err.message = 'Logout Unsuccessfull!'; next(err)}
});

//////////////////////////////////////////////////TEST FRONT////////////////////////////////////////////////////////////
router.post("/data", async(req, res) =>
{
    try {
        console.log(req.body);
        const tes = req.body;
        
        res.json({ tes })
        
        } catch (err){
        res.status(500).json({ success: false, err })
        }
});
//////////////////////////////////////////////////TEST FRONT////////////////////////////////////////////////////////////


module.exports = router;

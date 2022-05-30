const router = require("express").Router();
const User = require("../../models/User");

const   speakeasy = require("speakeasy"),
        qrcode = require("qrcode"),
        passport = require("passport");
        randomWords = require('random-words');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require("../../controllers/v1/authController");
const mailer = require("../../controllers/v1/mailerController");
const {upload} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

//GOOGLE AUTH
router.get('/google', (req, res, next) => 
{
    passport.authenticate('google', 
    { 
        session: false,
        scope: [ 'email', 'profile' ]
    })(req, res, next);
});

//GOOGLE AUTH CALLBACK
router.get('/google/callback', auth.verifyProviderUser, (req, res, next) => {});

//FACEBOOK AUTH
router.get('/facebook', (req, res, next) => 
{
    passport.authenticate('facebook', 
    { 
        session: false,
        scope : ['email']
    })(req, res, next);
});

//FACEBOOK AUTH CALLBACK
router.get('/facebook/callback', auth.verifyProviderUser, (req, res, next) => {});

//GITHUB AUTH
router.get('/github', (req, res, next) => 
{
    passport.authenticate('github', 
    { 
        session: false,
        scope : ['user:email']
    })(req, res, next);
});

//GITHUB AUTH CALLBACK
router.get('/github/callback', auth.verifyProviderUser, (req, res, next) => {});

// LOGIN SUCCESS WITH PROVIDER
router.get('/login/validateOauth', cors.corsWithOptions, auth.verifyUserQuery, (req, res, next) =>
{
    
    const accessToken = auth.GenerateAccessToken({_id: req.user._id});
    const refreshToken = auth.GenerateRefreshToken({_id: req.user._id});
    
    if(req.user)
    {
        res.header('access_token', accessToken)
        .header('refresh_token', refreshToken)
        .status(200).json(
            {
                success: true,
                loggedIn: true,
                hasTFA: false,
                isAdmin: req.user.isAdmin,
                status: 'Login Successful!'
            });
    }
    else
    {
        res.status(500).json(
            {
                success : false,
                status : 'Authentication failed'
            });
    }
    

})

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

//USER VERIFICATION
router.get("/verify_email", auth.verifyEmailToken, async(req, res, next) =>
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

//VERIFY TFA RECOVERY
router.post('/TFARecovery', cors.corsWithOptions, upload.any('imageFile'), auth.verifyUserTFARecovery, auth.verifyRefresh, async (req, res, next) =>
{
    try
    {
        if(req.user.TFASecret && req.user.TFARecovery)
        {
            const TFARecoveryInitial = req.user.TFARecovery;
            const TFARecoveryEntered = req.body.TFARecovery;
            
            if(JSON.stringify(TFARecoveryInitial) == JSON.stringify(TFARecoveryEntered))
            {
                const TFASecret = req.user.TFASecret;
                const otpAuthURL = `otpauth://totp/Nutritiv(${req.user.username})?secret=${TFASecret}`
                
                qrcode.toDataURL(otpAuthURL, (err, data) =>
                {
                    // res.setHeader("Content-Type", "text/html");
                    // res.write(`<img src='${data}'>`);
                    // res.send();
                    
                    res .status(200).json({data, secret : TFASecretBase32})
                        
                })
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
    }catch(err){next(err);}
})

//CREATE SECRET TOTP
router.post('/TFASecret', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
async(req, res, next) => 
{
    try
    {
        if(!req.user.TFASecret)
        {
            const TFASecret = speakeasy.generateSecret(
                {
                    name: `Nutritiv(${req.user.username})`,
                    length: 20
                })
            const TFASecretBase32 = TFASecret.base32;
            const twoFAToken = auth.GenerateNewTFAToken(req.user._id, TFASecretBase32);
            
            qrcode.toDataURL(TFASecret.otpauth_url, (err, data) =>
            {
                // res .header('new_twofa_token', twoFAToken)
                // res.setHeader("Content-Type", "text/html");
                // res.write(`<img src='${data}'>`);
                
                // res.send();
                
                res .header('new_twofa_token', twoFAToken)
                    .status(200).json({data, secret : TFASecretBase32})
                    
            })
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
})

//CREATE TOKEN FROM TOTP SECRET
// router.post('/totpGenerate', async(req, res, next) => 
// {
//     try
//     {
//         const TFASecret = req.body.TFASecret;
//         const token = speakeasy.totp(
//             {
//                 TFASecret: TFASecret,
//                 encoding: 'base32'
//             })
        
            
//         res.status(200).json(
//             {
//                 success: true, 
//                 token
//             });

//     }catch(err){next(err)}
// })

//DISABLE TFA
router.post('/disableTFA', auth.verifyUser, auth.verifyRefresh, async(req, res, next) =>
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
                        console.log("Password is correct!");
                        
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
                            
                                res.status(201).json(
                                    {
                                        success: true, 
                                        status: 'Your successfully disabled TFA!',
                                    });
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
})

//VERIFY TFA
router.post('/enableTFA', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyUserNewTFA, async(req, res, next) =>
{
    try
    {
        let user = req.user, password = req.body.password;
        
        if(!user.TFASecret)
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
                        console.log("Password is correct!");

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

                                res.status(201).json(
                                    {
                                        success: true, 
                                        TFARecovery,
                                        status: 'Your successfully enabled TFA!',
                                    });
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
                    status: "Your account already have enabled TFA!"
                })
        }
    }catch(err){next(err)}
})

// router.post('/tfa', async(req, res, next) =>
// {
//     const users = await User.find();
    
//     users.map(async user => 
//         {
//             if(user.TFASecret)
//             {
//                 const test = await User.findOneAndUpdate({_id: user._id},
//                     {
//                         $unset: {TFASecret: ""}
//                     });
//                     console.log(`test = `, test)
//                 await test.save();
                
//             }
//         }
//     )
//     res.status(200).json(
//         {
//             success: true,
//             users
//         })
// })

//CREATE TOKEN FROM TOTP SECRET
router.post('/TFAValidation', cors.corsWithOptions, auth.verifyNoRefresh, auth.verifyUserTFA, 
async(req, res, next) => 
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
            });
        }
        else
        {
            let err = new Error('The code is invalid or expired!');
            err.statusCode = 401;
            return next(err);
        }
    
    }catch(err){next(err)}
})

//LOGIN
router.post("/login", cors.corsWithOptions, async(req, res, next)=>
{
    try
    {
        //passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login' }));
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
                        const twoFAToken = auth.GenerateTFAToken({_id: user._id});

                        res.header('twofa_token', twoFAToken)
                            .status(200).json(
                            {
                                success: true, 
                                hasTFA: true // refirect to /TFAValidation
                            })
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
                                    hasTFA: false,
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

//////////////////////////////////////////////////TEST REQUEST////////////////////////////////////////////////////////////
router.get("/test", async(req, res) =>
{
    try 
    {
        const tes = req.body;
        res.json({ tes })
    }catch(err){next(err)}
});
//////////////////////////////////////////////////TEST REQUEST////////////////////////////////////////////////////////////


module.exports = router;

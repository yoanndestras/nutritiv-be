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
    try
    {
        passport.authenticate('google', 
        { 
            session: false,
            scope: [ 'email', 'profile' ]
        })(req, res, next);
    }catch (err){next(err)}
});

//GOOGLE AUTH CALLBACK
router.get('/google/callback', auth.verifyProviderUser, (req, res, next) => {});

//FACEBOOK AUTH
router.get('/facebook', (req, res, next) => 
{
    try
    {
        passport.authenticate('facebook', 
        { 
            session: false,
            scope : ['email']
        })(req, res, next);
    }catch (err){next(err)}
});

//FACEBOOK AUTH CALLBACK
router.get('/facebook/callback', auth.verifyProviderUser, (req, res, next) => {});

//GITHUB AUTH
router.get('/github', (req, res, next) => 
{
    try
    {
        passport.authenticate('github', 
        { 
            session: false,
            scope : ['user:email']
        })(req, res, next);
    }catch (err){next(err)}
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

//VERIFY FORGET PASSWORD EMAIL
router.get("/verify_forget_pwd", auth.verifyEmailToken, async(req, res, next) =>
{
    try
    {
        const token = auth.GenerateEmailToken(req.user.email, req.user.updatedAt);
        
        res.redirect(process.env.SERVER_ADDRESS + 
            'reset-password/'+
            '?status=pwdSuccessfull' +
            `&token=${token}`
            // '&statusCode=200'
            )
    }catch(err){next(err)}
});

//GENERATE NEW EMAIL TOKEN
router.get("/new_register_email", auth.verifyNewEmail, mailer.sendVerifyAccountMail, 
async(req, res, next) =>
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
router.post("/verify_email", auth.verifyNewUserEmail, async(req, res, next) =>
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

//FORGET PASSWORD EMAIL
router.post("/forget_pwd", auth.verifyEmailExist, mailer.sendForgetPassword, async(req, res, next) =>
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

//REGISTER
router.post("/register", auth.verifyUsername, auth.verifyEmail, auth.verifyEmailSyntax, 
auth.verifyPasswordSyntax, auth.verifyCaptcha, auth.register, mailer.sendVerifyAccountMail, async(req, res, next) =>
{
    try
    {
        res.status(201).json(
            {
                success: true, 
                status: 'Registration Successfull! Check your emails!'
            });
    }catch(err){next(err)}
});

//NEW PASSWORD AND RESET LOGIN ATTEMPTS
//auth.verifyEmailToken
router.post("/new_password", auth.verifyNewUserEmail, auth.verifyNewPasswordSyntax, 
auth.verifyNewPasswordEquality, async(req, res, next) =>
{
    try
    {        
        const userId = req.user?._id
        const user = await User.findById(userId);
        const newPass = req.body.confirmNewPass;
        
        if(user && newPass)
        {
            // user.forgetPass = false;
            await user.resetAttempts();
            await user.setPassword(newPass);
            await user.save();
            
            res.status(201).json(
                {
                    success: true, 
                    status: 'Reset password successfull!'
                });
        }
        else
        {
            res.status(400).json(
                {
                    success: false, 
                    status: 'No user found!', 
                    err: err.message
                });
        }
    }catch(err){next(err)}
});

//VERIFY TFA RECOVERY
router.post('/TFARecovery', cors.corsWithOptions, upload.any('imageFile'), auth.verifyUserTFARecovery, 
auth.verifyRefresh, auth.createTFARecovery, async (req, res, next) =>
{
    try
    {
        const twoFAToken = req.twoFAToken, otpAuthURL = req.otpAuthURL, TFASecret = req.TFASecret;
        qrcode.toDataURL(otpAuthURL, (err, data) =>
        {
            // res.setHeader("Content-Type", "text/html");
            // res.write(`<img src='${data}'>`);
            // res.send();
            res .header('new_twofa_token', twoFAToken)
                .status(200).json({qrCodeUrl : otpAuthURL, qrCodeSecret : TFASecret})
        })
    
    }catch(err){next(err);}
})

//CREATE SECRET TOTP
router.post('/TFASecret', cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.createTFASecret,
async(req, res, next) => 
{
    try
    {
        const twoFAToken = req.twoFAToken, otpAuthURL = req.otpAuthURL, TFASecretBase32 = req.TFASecretBase32;
        qrcode.toDataURL(otpAuthURL, (err, data) =>
        {
            // res .header('new_twofa_token', twoFAToken)
            // res.setHeader("Content-Type", "text/html");
            // res.write(`<img src='${data}'>`);
            // res.send();
            
            res .header('new_twofa_token', twoFAToken)
                .status(200).json({qrCodeUrl : otpAuthURL, qrCodeSecret : TFASecretBase32})
                
        })
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
router.post('/disableTFA', auth.verifyUser, auth.verifyRefresh, auth.disableTFA, async(req, res, next) =>
{
    try
    {
        res.status(201).json(
            {
                success: true, 
                status: 'Your successfully disabled TFA!',
            });
    }catch(err){next(err)}
})

//VERIFY TFA
router.post('/enableTFA', cors.corsWithOptions, auth.verifyUserNewTFA, auth.verifyRefresh, 
auth.enableTFA, async(req, res, next) =>
{
    try
    {
        res.status(201).json(
            {
                success: true, 
                status: 'Your successfully enabled TFA!',
                TFARecovery
            });
    }catch(err){next(err)}
})

//CREATE TOKEN FROM TOTP SECRET
router.post('/TFAValidation', cors.corsWithOptions, auth.verifyNoRefresh, auth.verifyUserTFA, 
auth.TFAValidation, async(req, res, next) => 
{
    try
    {
        const accessToken = req.accessToken, refreshToken = req.refreshToken, isAdmin = req.user.isAdmin;

        res .header('access_token', accessToken)
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
                    isAdmin: isAdmin,
                    status: 'Login Successful!'
                });
    
    }catch(err){next(err)}
})

//LOGIN
router.post("/login", cors.corsWithOptions, auth.verifyCaptcha, auth.login, async(req, res, next)=>
{
    try
    {
        const accessToken = req.accessToken, refreshToken = req.refreshToken, isAdmin = req.user.isAdmin;
        
        res .header('access_token', accessToken)
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
                    isAdmin: isAdmin,
                    status: 'Login Successful!'
                });
    
    }catch(err){next(err)}
});

// CLEAR COOKIE TOKEN // LOGOUT
router.delete("/logout", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res, next) =>
{   
    try
    {
        res .clearCookie("refresh_token")
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

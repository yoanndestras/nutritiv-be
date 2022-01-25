const express = require('express');
const sgMail = require("@sendgrid/mail");
const auth = require("./authenticate");

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));


exports.sendVerifyAccountMail = async(req, res, next) =>
{
    try
    {
        console.log("Im here accountmail 1");
        
        const Email_Token = auth.GenerateEmailToken({email: req.body.formData.email});
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = 
        {
            to: req.body.formData.email,
            from:"nutritivshop@gmail.com",
            subject:"Nutritiv - Account email verification",
            html : `
            <h1>Hello, </h1>
            <p style="color: red;">Thanks for registering on our website.</p>
            <p>Please click on the link below to verify your account.</p>
            <a  href="http://${req.headers.host}/api/auth/verify-email?token=${Email_Token}">Verify your account</a>`
        }       //  ${req.headers.Host}
        
        await sgMail.send(msg);
    
        console.log("Im here accountmail 2");
        next();
    }
    catch(err)
    {
        var err = new Error('Email sending Error!');
        err.status = 400;
        return next(err);
    }
    
} 

exports.sendForgetPassword = async(req, res, next) =>
{
    try
    {
        console.log("Im here forget password 1");
        
        const Email_Token = auth.GenerateEmailToken({email: req.body.email});
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const user = req.user;
        const msg = 
        {
            to: req.body.email,
            from:"nutritivshop@gmail.com",
            subject:"Nutritiv - Reset password",
            html : `
            <h1>Hello, ${user.username}</h1>
            <p>Please click on the link below to reset your password.</p>
            <a  href="http://${req.headers.host}/api/auth/verify_forget_pwd?token=${Email_Token}">Reset Password</a>`
        }       //  ${req.headers.Host}
        
        await sgMail.send(msg);
        
        console.log("Im here forget password 2");
        next();
    }
    catch(err)
    {
        var err = new Error('Email sending Error!');
        err.status = 400;
        return next(err);
    }
    
} 


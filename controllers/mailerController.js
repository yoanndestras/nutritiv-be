const User = require("../models/User");

const sgMail = require("@sendgrid/mail");
const auth = require("./authController");
const path = require('path');


exports.sendVerifyAccountMail = async(req, res, next) =>
{
    try
    {        
        const Email_Token = auth.GenerateEmailToken({email: req.body.email});
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const imgPath = path.resolve("public/images/Nutritiv.png")
        console.log(imgPath);
        const email = req.body.email;
        const mailContent = 
        {
            to: email,
            from:"nutritivshop@gmail.com",
            subject:"Verify your email to activate your account !",
            text: "About your Nutritiv account. Verify email address :",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system, 
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127)">
                <div style="margin-left: 30%;margin-right: 30%; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Verify your email address so we know it’s really you—and so we can activate your Nutritiv account.</p>
                    <a style="text-decoration: none;display:block; text-align: center;width:100%;font-weight: bold; padding: 10px; color: white; 
                    background-color: #00A8F3; border: none; border-radius:  5px;"
                    href='http://${req.headers.host}/auth/verify-email?token=${Email_Token}'>Verify email address</a>
                    
                    <p>Thanks,</p>
                    <p>Nutritiv</p>
                </div>
            </div>
            `
        }       //  ${req.headers.Host}
        
        await sgMail.send(mailContent);
        next();
    }catch(err){next(err)}
    
} 

exports.sendForgetPassword = async(req, res, next) =>
{
    try
    {        
        const Email_Token = auth.GenerateEmailToken({email: req.body.email});
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const email = req.body.email, user = req.user;
        const mailContent = 
        {
            to: email,
            from:"nutritivshop@gmail.com",
            subject:"Reset your Nutritiv account password",
            text: "About your Nutritiv account. Reset your password :",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system,
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127)">
                <div style="margin-left: 30%;margin-right: 30%; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Hello, ${user.username}</p>
                    <p>Please click on the link below to reset your Nutritiv account password.</p>
                    <a style="text-decoration: none;display:block; text-align: center;width:100%;font-weight: bold; padding: 10px; color: white; 
                    background-color: #00A8F3; border: none; border-radius:  5px;"
                    href="http://${req.headers.host}/auth/verify_forget_pwd?token=${Email_Token}">Reset Password</a>
                    
                    <p>Thanks,</p>
                    <p>Nutritiv</p>
                </div>
            </div>
            `
        }   
        
        await sgMail.send(mailContent);
        next();
    }catch(err){next(err)}
    
    
} 

exports.sendUpdateUsername = async(req, res, next) =>
{
    try
    {   
        const user = await User.findOne({_id: req.user._id});

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const email = user.email, username = user.username;
        const mailContent = 
        {
            to: email,
            from:"nutritivshop@gmail.com",
            subject:"Your username has been updated",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system, 
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127)">
                <div style="margin-left: 30%;margin-right: 30%; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Hello, ${username}</p>
                    <p>Your username has been updated from ${req.user.username} to ${username}.</p>
                    
                    <p>Thanks,</p>
                    <p>Nutritiv</p>
                </div>
            </div>
            `
        }   
        
        await sgMail.send(mailContent);
        next();
    }catch(err){next(err)}
}

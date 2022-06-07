const User = require("../../models/User");
const Order = require("../../models/Order");

const sgMail = require("@sendgrid/mail");
const auth = require("./authController");
const path = require('path');


exports.sendVerifyAccountMail = async(req, res, next) =>
{
    try
    {        
        const Email_Token = auth.GenerateEmailToken({email: req.body.email});
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const email = req.body.email;
        const link = `${req.protocol}://${req.headers.host}/v1/auth/verify_email?token=${Email_Token}` //  ${req.headers.Host}
        console.log(link);
        const mailContent = 
        {
            to: email,
            from: 
            {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            templateId: 'd-55649386d54647e796fb5709460a28cd',
            dynamicTemplateData: 
            {
                "link" : link
            }
        }
        
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
            from: {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            subject:"Reset your Nutritiv account password",
            text: "About your Nutritiv account. Reset your password :",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system,
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127) !important">
                <div style="max-width:500px;margin: auto; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Hello, ${user.username}</p>
                    <p>Please click on the link below to reset your password.<br><br>
                    <a style="text-decoration: none;display:block; text-align: center;width:100%;font-weight: bold; padding: 10px; color: white; 
                    background-color: #00A8F3; border: none; border-radius:  5px;"
                    href="${process.env.SERVER_ADDRESS}v1/auth/verify_forget_pwd?token=${Email_Token}">Reset Password</a><br>
                    Thanks,</p>
                    
                    <p>Nutritiv</p>
                    <hr>
                    <p style="font-size: 0.75em; color: #88B4D6">Nutritiv, 245 Rue du Tilleul, Paris, France</p>
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
            from: {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            subject:"Your username has been updated",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system, 
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127) !important">
                <div style="max-width: 500px; margin: auto; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Hello, ${username}</p>
                    <p>Your username has been updated from <span style="font-weight:bold">${req.user.username}</span> to <span style="font-weight:bold">${username}</span>.<br><br>
                    Thanks,<br>
                    </p>
                
                    <p>Nutritiv</p>
                    <hr>
                    <p style="font-size: 0.75em; color: #88B4D6">Nutritiv, 245 Rue du Tilleul, Paris, France</p>
                </div>
            </div>
            `
        }   
        
        await sgMail.send(mailContent);
        next();
    }catch(err){next(err)}
}


exports.sendUpdateEmail = async(req, res, next) =>
{
    try
    {   
        const user = await User.findOne({_id: req.user._id});

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const email = user.email, username = user.username;
        const mailContent = 
        {
            to: email,
            from: {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            subject:"Your email has been updated",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system, 
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127) !important">
                <div style="max-width: 500px; margin: auto; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Hello, ${username}</p>
                    <p>Your email has been updated from <span style="font-weight:bold">${req.user.email}</span> to <span style="font-weight:bold">${email}</span>.<br><br>
                    Thanks,<br>
                    </p>
                
                    <p>Nutritiv</p>
                    <hr>
                    <p style="font-size: 0.75em; color: #88B4D6">Nutritiv, 245 Rue du Tilleul, Paris, France</p>
                </div>
            </div>
            `
        }   
        
        await sgMail.send(mailContent);
        next();
    }catch(err){next(err)}
}

exports.sendNewOrder = async(req, res, next) =>
{
    try
    {   
        const orders = await Order.find({userId: req.user._id}).sort({updatedAt: -1});
        let order = orders[0];
        req.order = order;
        const orderDetails = order.orderDetails[0];
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const total = parseFloat(order.amount.value + 4.95) ;
        const email = req.user.email, username = req.user.username;
        
        const mailContent = 
        {
            to: email,
            from: 
            {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            templateId: 'd-671ec15432884fa1ac0d5bc5cd85491d',
            dynamicTemplateData: 
            {
                "order" : order,
                "username": username,
                "email" : email,
                "total" : total,
                "orderDetails": orderDetails
            },
        }   
        await sgMail.send(mailContent)
        next();
    }catch(err){next(err)}
}

exports.orderShipping = async(req, res, next) =>
{
    try
    {   
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const email = req.user.email, username = req.user.username, order = req.order;
        const mailContent = 
        {
            to: email,
            from: {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            subject:"Your order has been shipped!",
            html : `
            <div style="width: 100%; background-color: #F6F9FC; font-size: 15px ;font-family: -apple-system, 
                BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; color: rgb(82, 95, 127) !important">
                <div style="max-width: 500px;margin: auto; padding: 50px; background-color:white">
                    <h1 style="font-size:2em; color: #00A8F3">Nutritiv</h1>
                    <hr>
                    <p>Hello, ${username}</p>
                    <p>Thank you for your order, your order has been successfully shipped by "Shipping Company"<br><br>
                    <hr>
                    Your command : ${order._id} has been shipped !<br>
                    Thanks,<br>
                    </p>
                
                    <p>Nutritiv</p>
                    <hr>
                    <p style="font-size: 0.75em; color: #88B4D6">Nutritiv, 245 Rue du Tilleul, Paris, France</p>
                </div>
            </div>
            `
        }   
        await sgMail.send(mailContent)
        next();
    }catch(err){next(err)}
}

exports.orderDelivered = async(req, res, next) =>
{
    try
    {   
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const email = req.user.email, username = req.user.username, order = req.order,  date = new Date();

        const mailContent = 
        {
            to: email,
            from: 
            {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            templateId: 'd-1d060cd5e94843abacf710623dbe9d7a',
            dynamicTemplateData: 
            {
                "order" : order,
                "username" : username,
                "email" : email,
                "date": date
            },
        }   
        
        await sgMail.send(mailContent)
        next();
    }catch(err){next(err)}
}

const User = require("../../models/User");
const Order = require("../../models/Order");

const sgMail = require("@sendgrid/mail");
const auth = require("./authController");
// const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.sendVerifyAccountMail = async(req, res, next) =>
{
    try
    {        
        const updatedAt = req.updatedAt ? req.updatedAt : req.user.updatedAt;
        const Email_Token = auth.GenerateEmailToken(req.body.email, updatedAt);
        
        const email = req.body.email;
        const link = `${process.env.SERVER_ADDRESS}?verificationToken=${Email_Token}` //  ${req.headers.Host}
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
        const Email_Token = auth.GenerateEmailToken(req.body.email, req.user.updatedAt);
        
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
        const {street, city, zip, country, phone, customer_email, order_id} = req.body;
        
        const orders = await Order.find({userId: req.user._id}).sort({updatedAt: -1});
        const order = orders[0], username = req.user.username;
        req.order = order
        // const orderDetails = order.orderDetails[0];
        
        // const date = new Date();
        // const currentHour = date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
        const currentDay = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-');
        
        const total = parseFloat(order.amount.value) ;
        const mailContent = 
        {
            to: customer_email,
            from: 
            {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            templateId: 'd-671ec15432884fa1ac0d5bc5cd85491d',
            dynamicTemplateData: 
            {
                "order_id" : order_id,
                "username": username,
                "date": currentDay,
                "email" : customer_email,
                "total" : total,
                "orderDetails": {
                    "street" : street,
                    "zip": zip,
                    "country": country,
                    "city" : city,
                    "phoneNumber": phone,
                },
                "order" : order,
            },
        }   
        await sgMail.send(mailContent)
        next();
    }catch(err){console.log(err);}
}

exports.orderShipping = async(req, res, next) =>
{
    try
    {   
        const email = req.body.customer_email, username = req.user.username, orderId = req.body.order_id;
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
                    Your command : ${orderId} has been shipped !<br>
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
    }catch(err){console.log(err);}
}

exports.orderDelivered = async(req, res, next) =>
{
    try
    {   
        const   username = req.user.username, 
                date = new Date(),
                currentDay = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-'),
                currentHour = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

        const {street, city, zip, country, phone, customer_email, order_id} = req.body;

        const mailContent = 
        {
            to: customer_email,
            from: 
            {
                email: "nutritivshop@gmail.com",
                name : "Nutritiv"
            },
            templateId: 'd-1d060cd5e94843abacf710623dbe9d7a',
            dynamicTemplateData: 
            {
                "order_id" : order_id,
                "username" : username,
                "email" : customer_email,
                "date": currentDay + " at " + currentHour,
                "orderDetails": {
                    "street" : street,
                    "zip": zip,
                    "country": country,
                    "city" : city,
                    "phoneNumber": phone,
                }
            },
        }   
        
        await sgMail.send(mailContent)
        next();
    }catch(err){console.log(err);}
}

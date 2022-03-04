const sgMail = require("@sendgrid/mail");
const auth = require("./authController");


exports.sendVerifyAccountMail = async(req, res, next) =>
{
    try
    {        
        const Email_Token = auth.GenerateEmailToken({email: req.body.formData.email});
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const email = req.body.formData.email;
        const mailContent = 
        {
            to: email,
            from:"nutritivshop@gmail.com",
            subject:"Nutritiv - Account email verification",
            html : `
            <h1>Hello, </h1>
            <p style="color: red;">Thanks for registering on our website.</p>
            <p>Please click on the link below to verify your account.</p>
            <a  href="http://${req.headers.host}/auth/verify-email?token=${Email_Token}">Verify your account</a>`
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
            subject:"Nutritiv - Reset password",
            html : `
            <h1>Hello, ${user.username}</h1>
            <p>Please click on the link below to reset your password.</p>
            <a  href="http://${req.headers.host}/auth/verify_forget_pwd?token=${Email_Token}">Reset Password</a>`
        }   
        
        await sgMail.send(mailContent);
        next();
    }catch(err){next(err)}
    
    
} 


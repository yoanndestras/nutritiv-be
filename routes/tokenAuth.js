const jwt = require('jsonwebtoken');
const authenticate = require("./tokenAuth");

exports.GenerateAccessToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.JWT_SEC, 
        {expiresIn: "1800s"} // expires in 15 minutes
    );
};

exports.GenerateRefreshToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.REF_JWT_SEC,
        {expiresIn: "7d"}
    );
};

exports.verifyToken = (req, res, next) =>
{
    const autHeader = req.headers["authorization"];

    if(autHeader)
    {
        
        const token = autHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) =>
        {
            if(err) res.status(403).json({success: false, err: "invalid_token", error_description: "The access token expired"});
            req.user = user;
            next();
        });
    }
    else
    {
        return res.status(401).json("You are not authenticated !");
    }
};

exports.verifyRefreshToken = (req, res, next) =>
{
    const token = req.headers.token;
    
    if(token)
    {
        
        jwt.verify(token, process.env.REF_JWT_SEC, (err, user) =>
        {
            if(err) res.status(403).json({success: false, err: "invalid_token", error_description: "The refresh token do not exist"});
            req.user = user;
            next();
        });
    }
    else
    {
        return res.status(401).json("You are not authenticated !");
    }
};

exports.verifyTokenAndAuthorization = (req, res, next) =>
{
    verifyToken(req, res, () =>
    {
        if(req.user.id === req.params.id || req.user.isAdmin)
        {
            next();
        }
        else
        {
            res.status(403).json("You are not allowed to do that !");
        }
    });
};

exports.verifyTokenAndAdmin = (req, res, next) =>
{
    authenticate.verifyToken(req, res, () =>
    {
        if(req.user.isAdmin)
        {
            next();
        }
        else
        {
            res.status(403).json("You are not allowed to do that !");
        }
    });
};

const jwt = require('jsonwebtoken');


exports.GenerateAccessToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.JWT_SEC, 
        {expiresIn: "1800s"}
    );
};

exports.GenerateRefreshToken = function(user) 
{
    return jwt.sign
    (
        user, 
        process.env.REF_JWT_SEC, 
        {expiresIn: "1y"}
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
            if(err) res.status(403).json("Token is not valid!");
            req.user = user;
            next();
        });
    }
    else
    {
        return res.status(401).json("You are not authenticated !");
    }
};

// const verifyrefreshToken = (req, res, next) =>
// {
//     const autHeader = req.headers.token;
    
//     if(autHeader)
//     {
        
//         const token = autHeader.split(" ")[1];
//         jwt.verify(token, process.env.REF_JWT_SEC, (err, user) =>
//         {
//             if(err) res.status(403).json("RefreshToken is not valid");
//             req.user = user;
//             next();
//         });
//     }
//     else
//     {
//         return res.status(401).json("You are not authenticated !");
//     }
// }

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
    verifyToken(req, res, () =>
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

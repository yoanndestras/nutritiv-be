const cors = require('cors');
const dotenv = require("dotenv"); // ENV FILES
dotenv.config(); // INITIALIZE ENVIRONNEMENT VARIABLE FILE ".env"

let whitelist = process.env.CORS_WHITELIST.split(' '); //'https://DESKTOP-DBB3L91:3001'

const corsOptionsDelegate = (req, callback) => 
{
    let corsOptions;
    // console.log(req.headers.origin);
    // req.headers.origin = req.headers?.host;
    
    let origin = req.headers?.origin ? req.headers.origin : req.headers?.host;
    
    if(whitelist.indexOf(origin) !== -1) 
        {
            corsOptions = 
            { 
                origin: true, 
                credentials: true, 
                exposedHeaders: ['access_token', 'refresh_token', 'twofa_token', 'new_twofa_token'], 
                allowedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept', 'Content-Length', 'X-Foo', 'X-Bar', 'access_token', 'refresh_token', 'twofa_token', 'new_twofa_token']
            };
            console.log({ origin: true });
            console.log(`process.env.DB_NAME = `, process.env.DB_NAME)
            console.log(`process.env.DB_NAME = `, process.env.DB_NAME)
            console.log(`process.env.DB_NAME = `, process.env.DB_NAME)
            console.log(`process.env.DB_NAME = `, process.env.DB_NAME)
            console.log(`process.env.DB_NAME = `, process.env.DB_NAME)
            console.log(`process.env.DB_NAME = `, process.env.DB_NAME)
        }
    else 
        {
            corsOptions = { origin: false };
            console.log(corsOptions);
        }
    
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
const cors = require('cors');
const dotenv = require("dotenv"); // ENV FILES
dotenv.config(); // INITIALIZE ENVIRONNEMENT VARIABLE FILE ".env"

let whitelist = process.env.CORS_WHITELIST.split(' '); //'https://DESKTOP-DBB3L91:3001'

const corsOptionsDelegate = (req, callback) => 
{
    let corsOptions;
    req.headers.origin = req.headers?.host;

    if(whitelist.indexOf(req.headers.origin) !== -1) 
        {
            
            corsOptions = 
            { 
                origin: true, 
                credentials: true, 
                exposedHeaders: ['access_token', 'refresh_token'], 
                allowedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept', 'access_token', 'refresh_token']
            };
            console.log({ origin: true });
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
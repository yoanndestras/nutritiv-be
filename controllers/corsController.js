const cors = require('cors');

const whitelist = ['http://localhost:9000', 'http://localhost:3001', 'https://localhost:3001', 'http://192.168.1.23:3000', '0.0.0.0:3000']; //'https://DESKTOP-DBB3L91:3001'

const corsOptionsDelegate = (req, callback) => 
{
    let corsOptions;
    
    if(whitelist.indexOf(req.header('Origin')) !== -1) 
        {
            corsOptions = 
            { 
                origin: true, 
                credentials: true, 
                exposedHeaders: ['access_token', 'refresh_token'], 
                allowedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept', 'access_token', 'refresh_token']
            };
            console.log(corsOptions);
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
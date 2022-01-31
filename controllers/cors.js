const cors = require('cors');

const whitelist = ['http://localhost:9000', 'http://localhost:3001', 'https://localhost:3001']; //'https://DESKTOP-DBB3L91:3001'

const corsOptionsDelegate = (req, callback) => 
{
    let corsOptions;
    
    
            corsOptions = { origin: true, credentials: true, allowedHeaders: ['X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Access-Token, Refresh-Token']};
            console.log(corsOptions);
    callback(null, corsOptions);
};


exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
'use strict';

const app = require('./app');
const serverless = require('serverless-http');

app.get('/', async (req, res, next) => {
    res.status(200).send('Hello World!')
})
module.exports.hello = serverless(app)



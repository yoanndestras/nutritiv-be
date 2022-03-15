const express = require("express");
const mongoose = require("mongoose");

const limitter = require('express-rate-limit');
const path = require('path');
const dotenv = require("dotenv");
const passport = require('passport');
const cookieParser = require("cookie-parser");
const cors = require('cors');

// router based on url
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const {uploadRouter} = require('./routes/upload');
const stripeRoute = require("./routes/stripe");

dotenv.config();

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err)=>
    {
        console.log(err);
    });

const app = express();
const router = express.Router();

// HEALTH CHECK
router.get('/health', (req, res) => 
{
    const data = {
        uptime: process.uptime(),
        message: 'Ok',
        date: new Date()
    }

    res.status(200).send(data);
});

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(cookieParser());

app.use(cors()); // apply simple cors on all routes
// app.options('*', cors());

app.use( 
    limitter(
        {
            windowMs: 5000,
            max: 10,
            message: {
                code: 429,
                message: "Too many requests"
            }
        })
    )

app.use(express.static(path.join(__dirname, 'public')));

const version = process.env.API_VERSION;

app.use(`/${version}`, router);
app.use(`/${version}/users`, userRoute);
app.use(`/${version}/auth`, authRoute);
app.use(`/${version}/products`, productRoute);
app.use(`/${version}/carts`, cartRoute);
app.use(`/${version}/orders`, orderRoute);
app.use(`/${version}/imageUpload`, uploadRouter);
app.use(`/${version}/stripe`, stripeRoute);

// process.env.PORT = value PORT in .env file
const port = (process.env.PORT || 4000);
app.listen(port, () =>
{
    console.log(`Backend server is running on port : ${port}`);
})

//ERROR HANDLING
app.use((err, req, res, next) =>
{
    let message = err.message ? err.message : "Unsuccessfull request!"
    
    !err.statusCode 
    ? res.status(500).json(
        {
            success: false, 
            err: message
        })
    : res.status(err.statusCode).json(
        {
            success: false, 
            err: message
        })
});

module.exports = app;
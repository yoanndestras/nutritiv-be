const express = require("express");
const mongoose = require("mongoose");
const limitter = require('express-rate-limit');

const path = require('path');
const dotenv = require("dotenv");
const passport = require('passport');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const http = require('http');

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

let app = express();

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
            max: 50,
            message: { 
                code: 429,
                message: "Too many requests"
            }
        })
    )

app.use(express.static(path.join(__dirname, 'public')));
// http://localhost:3001/images/Q1RAMagnesium_capsules.png

app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/products", productRoute);
app.use("/carts", cartRoute);
app.use("/orders", orderRoute);
app.use('/imageUpload', uploadRouter);
app.use('/stripe', stripeRoute);

// process.env.PORT = value PORT in .env file
app.listen(process.env.PORT || 5000, () =>
{
    console.log("Backend server is running on port " + process.env.PORT);
})

app.use(function(err, req, res, next) 
{
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500; // Sets a generic server error status code if none is part of the err
    
    if (err.shouldRedirect) 
    {
        res.render('myErrorPage') // Renders a myErrorPage.html for the user
    }
    else 
    {
        res.status(err.statusCode).send(err.message); // If shouldRedirect is not defined in our error, sends our original err data
    }
});

module.exports = app;
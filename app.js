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

dotenv.config();

mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>console.log("DB Connection Successfull"))
    .catch((err)=>
    {
        console.log(err);
    });

const app = express();

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
            max: 5,
            message: { 
                code: 429,
                message: "Too many requests"
            }
        })
    )

app.use(express.static(path.join(__dirname, 'public')));
// http://localhost:3001/images/Multivitamines.png

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use('/api/imageUpload', uploadRouter);

// process.env.PORT = value PORT in .env file
app.listen(process.env.PORT, () =>
{
    console.log("Backend server is running on port " + process.env.PORT);
})

module.exports = app;
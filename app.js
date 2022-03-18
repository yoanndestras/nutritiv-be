const express = require("express");
const mongoose = require("mongoose");

const limitter = require('express-rate-limit');
const path = require('path');
const dotenv = require("dotenv");
const passport = require('passport');
const cookieParser = require("cookie-parser");
const cors = require('cors');

// router based on url

// V1
const userRouteV1 = require(`./routes/v1/user`);
const authRouteV1 = require(`./routes/v1/auth`);
const productRouteV1 = require(`./routes/v1/product`);
const cartRouteV1 = require(`./routes/v1/cart`);
const orderRouteV1 = require(`./routes/v1/order`);
const {uploadRouterV1} = require(`./routes/v1/upload`);
const stripeRouteV1 = require(`./routes/v1/stripe`);
const chatRouteV1 = require(`./routes/v1/chat`);

// V2
const userRouteV2 = require(`./routes/v2/user`);
const authRouteV2 = require(`./routes/v2/auth`);
const productRouteV2 = require(`./routes/v2/product`);
const cartRouteV2 = require(`./routes/v2/cart`);
const orderRouteV2 = require(`./routes/v2/order`);
const {uploadRouterV2} = require(`./routes/v2/upload`);
const stripeRouteV2 = require(`./routes/v2/stripe`);

dotenv.config();

const io = require("socket.io")(8900, 
    {
        cors:
        {
            origin: "http://localhost:3001"
        }
    });

// let users = [];

io.on("connection", (socket) =>
{
    console.log("a user connected");
    io.emit("welcome", "hello this is socket server!");
})

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

// V1
app.use(`/v1`, router);
app.use(`/v1/users`, userRouteV1);
app.use(`/v1/auth`, authRouteV1);
app.use(`/v1/products`, productRouteV1);
app.use(`/v1/carts`, cartRouteV1);
app.use(`/v1/orders`, orderRouteV1);
app.use(`/v1/imageUpload`, uploadRouterV1);
app.use(`/v1/stripe`, stripeRouteV1);
app.use(`/v1/chats`, chatRouteV1);

// V2
app.use(`/v2`, router);
app.use(`/v2/users`, userRouteV2);
app.use(`/v2/auth`, authRouteV2);
app.use(`/v2/products`, productRouteV2);
app.use(`/v2/carts`, cartRouteV2);
app.use(`/v2/orders`, orderRouteV2);
app.use(`/v2/imageUpload`, uploadRouterV2);
app.use(`/v2/stripe`, stripeRouteV2);

app.use(express.static(path.join(__dirname, "/nutritiv-fe/build")));

app.get("*", (req, res) =>
{
    res.sendFile(path.join(__dirname, "nutritiv-fe/build", "index.html"))
});

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
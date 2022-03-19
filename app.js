const express = require("express");
const mongoose = require("mongoose");

const limitter = require('express-rate-limit');
const path = require('path');
const dotenv = require("dotenv");
const passport = require('passport');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const routes = require("./router")

dotenv.config();

const io = require("socket.io")(8900, 
    {
        cors:
        {
            origin: "http://localhost:3001"
        }
    });

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


app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(cookieParser());

app.use(cors()); // apply simple cors on all routes
// app.options('*', cors());

app.use(routes);

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


app.use(express.static(path.join(__dirname, "/client/build/")));
console.log(__dirname);

app.get("*", (req, res) =>
{
    res.sendFile(path.join(__dirname, "/client/build/", "index.html"))
});

// process.env.PORT = value PORT in .env file
const port = (process.env.PORT || 5000);
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
const express = require("express"); // EXPRESS FRAMEWORK
const mongoose = require("mongoose"); // MONGODB OBJECT MODELING
const limitter = require('express-rate-limit'); // SPAM LIMITTER
const path = require('path'); // ACCESS TO FOLDERS PATHS
const dotenv = require("dotenv"); // ENV FILES
const passport = require('passport'); // PASSPORT FOR AUTH
const cookieParser = require("cookie-parser"); //COOKIES
const cors = require('cors'); // CORS POLICY
const routes = require("./router") // CALL V1 & V2 ROUTES FROM ROUTER FOLDER
const jwt = require('jsonwebtoken');

dotenv.config(); // INITIALIZE ENVIRONNEMENT VARIABLE FILE ".env"

//SOCKET IO BACK-END CONFIGURATION
const http = require('http').createServer(express);
const port = (process.env.PORT || 5000); // BACK-END PORT
const frontAddress = process.env.REACT_APP_ADDRESS;

const io = require("socket.io")(http,
    {
        cors: 
        {
            origin: frontAddress,
            methods: ["GET", "POST"],
            credentials: true
        },
    });

// io.use((socket, next) => 
// {  
    // if(socket.handshake?.query?.refreshToken)
    // {
    //     jwt.verify(socket.handshake?.query?.refreshToken, process.env.REF_JWT_SEC, (err, decoded) =>
    //     {
    //         if(err) 
    //         {
    //             let err = new Error('Authentication error')
    //             err.statusCode = 401;
    //             return next(err);
    //         }
        
    //         socket.decoded = decoded._id;
    //         next();
    //     });
    // }
    // else
    // {
    //     let err = new Error('Authentication error')
    //     err.statusCode = 401;
    //     next(err);
    // }
//     next();
// })
io.on("connection", (socket) =>
{
    console.log("An user is connected to the socket.io chat!");
    
    socket.on('message', ({text, id, refreshToken}) =>
    {

        let userId = jwt.verify(refreshToken, process.env.REF_JWT_SEC, (err, decoded) =>
        {
            return decoded._id;
        });
        
        
        console.log(`sender = `, userId)
        const sender = userId;
        // io.emit("message", ({text, id, sender}));
        io.emit("message", ({text, id, sender}));
    })
})


http.listen(4000, () => {console.log("Socket.io listening on port 4000!");})

// DATABASE ACCESS
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err)=>
    {
        console.log(err);
    });

const app = express(); // EXPRESS APPLICATION

app.use(express.json()); // APP LEARN TO READ JSON    
app.use(express.urlencoded({extended: true})); // APP LEARN TO READ JSON    
app.use(passport.initialize()); // INITIALIZE PASSPORT JS
app.use(cookieParser()); // INITIALIZE COOKIES
app.use(cors()); // INITIALIZE CORS  "app.options('*', cors());"
const trimmer = (req, res, next) =>
{    
    if(req.method === 'POST' || req.method === 'PUT') 
    {
        for(const [key, value] of Object.entries(req.body)) 
        {
            if(typeof(value) === 'string')
                req.body[key] = value.trim();
        }
    }
    next();
} // FUNCTION THAT REMOVE WHITESPACE
app.use(trimmer); // CALL TRIMMER
app.use(routes); // CALL V1 & V2 ROUTES FROM ROUTER FOLDER
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
    ) // LIMIT SPAM REQUESTS TO MAX PER MILLISECONDS
app.use(express.static(path.join(__dirname, 'public'))); // USE STATIC FILES ON PUBLIC FOLDER
app.use(express.static(path.join(__dirname, "/client/build/"))); // STATIC FILES FOR FRONT-END APP
app.get("*", (req, res) =>{res.sendFile(path.join(__dirname, "/client/build/", "index.html"))});

app.listen(port, () =>{console.log(`Backend server is running on port : ${port}`);})

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
}); //ERROR HANDLING "(catch(err){next(err)})""

module.exports = app;
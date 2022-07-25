const   mongoose = require("mongoose"), // MONGODB OBJECT MODELING
        express = require("express"); // EXPRESS FRAMEWORK

const   limitter = require('express-rate-limit'), // SPAM LIMITTER
        cookieParser = require("cookie-parser"), //COOKIES
        passport = require('passport'), // PASSPORT FOR AUTH
        dotenv = require("dotenv"), // ENV FILES
        fetch = require("node-fetch"),
        path = require('path'), // ACCESS TO FOLDERS PATHS
        cors = require('cors'), // CORS POLICY
        {socketConnection} = require("./utils/socketIo"), // CALL SOCKETIO
        routes = require("./routes/index"), // CALL V1 & V2 ROUTES FROM ROUTER FOLDER
        ObjectId = mongoose.Types.ObjectId;

exports.ObjectId = ObjectId;

dotenv.config(); // INITIALIZE ENVIRONNEMENT VARIABLE FILE ".env"

const   app = express(), // EXPRESS APPLICATION
        http = require('http').createServer(app),
        port = (process.env.PORT || 5000), // BACK-END PORT
        cron = require('node-cron'),
        whitelist = process.env.CORS_WHITELIST.split(' ');

http.listen(port, () => 
{
    // const host = http.address().address
    const port = http.address().port;
    {console.log(`Backend server is running on port : ${port}`);}
})

exports.closeHTTPConnection = () => {return http.close()};

// app.listen(port, () =>{console.log(`Backend server is running on port : ${port}`);})
const io = require("socket.io")(http,
    {
        allowRequest: (req, callback) => 
        {
            req.headers.origin = req.headers?.host;
            const originWhitelist = whitelist.some((origin) => origin === req.headers.origin);
            callback(null, originWhitelist);
        },
        cors:
        {
            methods: ["GET", "POST"],
            credentials: true
        },
    });

socketConnection(io);

if(process.env.DB_NAME !== "Nutritiv-testing")
{
    // DATABASE ACCESS
    mongoose
        .connect(process.env.MONGO_URL)
        .then(async () => console.log("Connected to MongoDB"))
        .catch((err)=>{console.log(err)});

    cron.schedule('0 16 * * *', async() => 
    {
        let response = await fetch(process.env.SERVER_ADDRESS + 'v1/dbBackups/', 
        {
            method: 'POST',
            body: JSON.stringify({
                dbName : process.env.DB_NAME,
                dbUser : process.env.DB_USER,
                dbPassword : process.env.DB_PASSWORD
            }),
            headers: 
            {
                "Origin": process.env.SERVER_ADDRESS,
                "Content-type": "application/json; charset=UTF-8"
            },
        });
        let data = await response.json();
        console.log(`data = `, data)
    }); // SAVE A DB BACKUP EVERYDAY AT 3 PM
}

app.use(express.json()); // APP LEARN TO READ JSON
app.use(express.urlencoded({extended: true})); // APP LEARN TO READ JSON  
app.use(passport.initialize()); // INITIALIZE PASSPORT JS
app.use(cookieParser()); // INITIALIZE COOKIES
app.use(cors()); // INITIALIZE CORS  "app.options('*', cors());"
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
app.use(routes); // CALL V1 & V2 ROUTES FROM ROUTER FOLDER
app.use(express.static(path.join(__dirname, 'public'))); // USE STATIC FILES ON PUBLIC FOLDER
// app.use(express.static(path.join(__dirname, "/client/build"))); // STATIC FILES FOR FRONT-END APP
// app.get("*", (req, res) =>{res.sendFile(path.join(__dirname, "/client/build", "index.html"))});

app.use((err, req, res, next) =>
{
    let message = err.message ? err.message : "Unsuccessfull request!"
    
    !err.statusCode 
    ? res.status(500).json(
        {
            success: false, 
            err: "Internal Server Error",
            message: message
        })
    : res.status(err.statusCode).json(
        {
            success: false, 
            err: message
        })
}); //ERROR HANDLING "(catch(err){next(err)})""

module.exports = app;


// categories : 
// [
//     muscles, growing, resistance, unique
// ]
const   mongoose = require("mongoose"), // MONGODB OBJECT MODELING
        express = require("express"); // EXPRESS FRAMEWORK

const   limitter = require('express-rate-limit'), // SPAM LIMITTER
        cookieParser = require("cookie-parser"), //COOKIES
        passport = require('passport'), // PASSPORT FOR AUTH
        dotenv = require("dotenv"), // ENV FILES
        path = require('path'), // ACCESS TO FOLDERS PATHS
        cors = require('cors'), // CORS POLICY
        {socketConnection} = require("./utils/socketIo"), // CALL SOCKETIO
        routes = require("./routes/index") // CALL V1 & V2 ROUTES FROM ROUTER FOLDER

const cron = require('node-cron');
const {backupMongoDB} = require("./utils/dbBackups") // CALL SOCKETIO

dotenv.config(); // INITIALIZE ENVIRONNEMENT VARIABLE FILE ".env"

let whitelist = process.env.CORS_WHITELIST.split(' ');

const app = express(); // EXPRESS APPLICATION

const   http = require('http').createServer(app),
        port = (process.env.PORT || 5000); // BACK-END PORT

http.listen(port, () => 
{
    // const host = http.address().address
    const port = http.address().port
    {console.log(`Backend server is running on port : ${port}`);}
})
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

// DATABASE ACCESS
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err)=>
    {
        console.log(err);
    });

const DB_NAME = process.env.DB_NAME;
const currentDay = new Date().toLocaleDateString('pt-PT').replace(/\//g,'-');
const ARCHIVE_PATH = path.join(__dirname, 'public/dbBackups', `${currentDay}_${DB_NAME}.gzip`);
cron.schedule('0 6 * * *', () => backupMongoDB(DB_NAME, ARCHIVE_PATH)); // SAVE A DB BACKUP EVERYDAY AT 5 AM

app.use(express.json()); // APP LEARN TO READ JSON
app.use(express.urlencoded({extended: true})); // APP LEARN TO READ JSON  
app.use(passport.initialize()); // INITIALIZE PASSPORT JS
app.use(cookieParser()); // INITIALIZE COOKIES
app.use(cors()); // INITIALIZE CORS  "app.options('*', cors());"
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
app.use(express.static(path.join(__dirname, "/client/build"))); // STATIC FILES FOR FRONT-END APP
app.get("*", (req, res) =>{res.sendFile(path.join(__dirname, "/client/build", "index.html"))});

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


// categories : 
// [
//     muscles, growing, resistance, unique
// ]
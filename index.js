const express = require("express");

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require('passport');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const path = require('path');

// router based on url
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const uploadRoute = require('./routes/upload');

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

app.use(express.static(path.join(__dirname, 'public')));
// http://localhost:3001/images/image.jpg

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use('/api/imageUpload', uploadRoute);



//process.env.PORT = value PORT in .env file
app.listen(process.env.PORT, () =>
{
    console.log("Backend server is running");
})

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

//   // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });
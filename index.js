const express = require("express");
// router based on url
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");

dotenv.config();

mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>console.log("DB Connection Successfull"))
    .catch((err)=>{
        console.log(err);
    });

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);


//process.env.PORT = value PORT in .env file
app.listen(process.env.PORT, () =>
{
    console.log("Backend server is running");
})
const express = require('express');
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const User = require("../../models/User");

// const stripe = require("stripe")(process.env.STRIPE_KEY);

const appFunctions = require('../../app');
const order = require('./ordersController');


const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

exports.newOrder = async(req, res, next) =>
{
  try
  {
    const user = await User.findOne({customerId : req.body.customerId});
    req.user = user;

    const userId = user._id, cart = await Cart.findOne({userId : userId});

    
    if(cart)
    {
      let products =  cart.products, amount =  cart.amount;
      const {street, zip, city, country, phone, order_id, name} = req.body;
      let orderDetails =  
        {
            name,
            street,
            zip,
            city,
            country,
            phoneNumber : phone 
        }
      
      const newOrder = new Order(
        {
            userId: appFunctions.ObjectId(userId),
            products,
            amount,
            sessionId : order_id,
            orderDetails,
        }), savedOrder = await newOrder.save();
      
      if(savedOrder)
      {
        await Cart.findOneAndDelete({userId: userId});
        req.order = savedOrder;
        req.cart = true;
        next();
      }
      else{req.cart = false;next()}
    }
    else{req.cart = false;next()}
  }catch(err){next(err)}
}

exports.countInStock = async(req, res, next) =>
{
  try
  {
    let cart, user, load, productArray, qty, array = [];
    if(req.route.path === "/expire-checkout-session")
    {
      user = await User.findOne({customerId : req.body.customerId});
      cart = await Cart.findOne({userId : user._id});
    }
    else
    {
      cart = await Cart.findOne({userId : req.user._id});
    }
    
    if(cart)
    {
      load = cart.products.map(product => product.productItems.map((productItems) => {return productItems.load;})); // 1 = load
      qty = cart.products.map(product => product.productItems.map((productItems) => {return productItems.quantity;})); // 2 = quantity
      productArray = cart.products.map(product => product.productId);
      
      let sumWithInitial;
    
      for (let i = 0; i < load.length; i++) 
      {
        let emptyTable = [], initialValue = 0;
        
        for (let j = 0; j < load[i].length; j++) 
        {
            emptyTable.push(load[i][j] * qty[i][j])
            sumWithInitial = emptyTable.reduce(
              (previousValue, currentValue) => previousValue + currentValue,
              initialValue
            );
        }
        array.push(sumWithInitial);
        
        let cartProduct = await Product.findOne({_id: productArray[i]}), stockAvailable = cartProduct.countInStock;
        
        if(stockAvailable - sumWithInitial <= 0 && req.route.path !== "/expire-checkout-session")
        {
          let err = new Error('The stock for this product is not available : ' + cartProduct.title);
          err.statusCode = 403;
          return next(err);
        }
      }
    }
    else
    {
      let err = new Error("You have no cart!");
      err.statusCode = 400;
      return next(err);
    }
    
    if(req.route.path === "/create-checkout-session")
    {
      for (let i = 0; i < load.length; i++) 
      {
        await Product.findOneAndUpdate(
          {_id: productArray[i]},
          {
            $inc :
            {
              "countInStock" : - array[i]
            }
          }
        )
      }
    }
    else if(req.route.path === "/expire-checkout-session")
    {
      for (let i = 0; i < load.length; i++) 
      {
        await Product.findOneAndUpdate(
          {_id: productArray[i]},
          {
            $inc :
            {
              "countInStock" : array[i]
            }
          }
        )
      }
    }
    next();


  }catch(err){next(err)}
  
}

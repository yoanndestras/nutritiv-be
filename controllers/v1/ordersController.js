const express = require('express');
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const mongoose = require('mongoose');
const order = require('./ordersController');

const addressValidator = require('address-validator');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

exports.newOrder = async(req, res, next) =>
{
  try
  {
    const userId = req.user.id, cart = await Cart.findOne({userId : userId});
    let countInStock = order.countInStock(userId);
    
    let err = await countInStock && (await countInStock).err ? (await countInStock).err : null;
    if(err){return next(err);}
    
    if(cart)
    {
      let products =  cart.products, amount =  cart.amount;
      const {street, zip, city, country, phoneNumber} = req.body;
      let orderDetails =  
        {
            street,
            zip,
            city,
            country,
            phoneNumber
        }
      
      const newOrder = new Order(
        {
            userId: mongoose.Types.ObjectId(userId),
            products,
            amount,
            orderDetails,
        }), savedOrder = await newOrder.save();
      
      if(savedOrder)
      {
        await Cart.findOneAndDelete({userId: userId});
        req.order = savedOrder;
        req.cart = true;
        next();
      }
      else{req.cart = false;next();}
    }
    else{req.cart = false;next();}
  }catch(err){next(err)}
}

exports.countInStock = async(userId) =>
{
  try
  {
    const cart = await Cart.findOne({userId : userId});
  
    let load = cart.products.map(product => product.productItems.map((productItems) => {return productItems.load;})); // 1 = load
    let qty = cart.products.map(product => product.productItems.map((productItems) => {return productItems.quantity;})); // 2 = quantity
    let productArray = cart.products.map(product => product.productId);
    
    let sumWithInitial, result, err, array = [];
  
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
      
      if(stockAvailable - sumWithInitial <= 0)
      {
        err = new Error('The stock for this product is not available : ' + cartProduct.title);
        err.statusCode = 403;
        return {err};
      }
    }
    
    for (let i = 0; i < load.length; i++) 
    {
      result = await Product.findOneAndUpdate(
        {_id: productArray[i]},
        {
          $inc :
          {
            "countInStock" : - array[i]
          }
        }
      )
    }
  }catch(err){next(err)}
  
}

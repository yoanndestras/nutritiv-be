const express = require('express');
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require('mongoose');
const order = require('./order');

const addressValidator = require('address-validator');
const validatePhoneNumber = require('validate-phone-number-node-js');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

exports.verifyPhoneNumber = (req, res, next) =>
{
  let phoneNumber = req.body.phoneNumber;
  if(validatePhoneNumber.validate(phoneNumber))
  {
    next();
  }
  else
  {
    res.status(500).json(
      {
        success: false,
        error: 'Invalid phone number'
      }
      );
  }
}

exports.newOrder = async(req, res, next) =>
{
  try
  {
    const userId = req.user.id;
    const cart = await Cart.findOne({userId : userId});
    
    let countInStock = order.countInStock(userId);
    
    let err = await countInStock && (await countInStock).err ? (await countInStock).err : null;
    if(err){return next(err);}
    
    if(cart)
    {
      let products =  cart.products;
      let amount =  cart.amount;
      
      const {address, zip, city, country, phoneNumber} = req.body;
      let orderDetails =  
        {
            address,
            zip,
            city,
            country,
            phoneNumber
        }
      
      const newOrder = new Order(
        {
            userId: mongoose.Types.ObjectId(userId),
            products: products,
            amount: amount,
            orderDetails: orderDetails,
        });
      
      const savedOrder = await newOrder.save();
      
      if(savedOrder)
      {
        await Cart.findOneAndDelete({userId: userId});
        req.order = savedOrder;
        req.cart = true;
        next();
      }
      else
      {
        req.cart = false;
        next();
      }
      
    }
    else
    {
      req.cart = false;
      next();
    }
    
  }
  catch(err)
  {
    res.status(500).json(
      {
          success: false,
          status: "Unsuccessfull request!",
          err : err.message
      }
  );
  }
}

exports.countInStock = async(userId) =>
{
  const cart = await Cart.findOne({userId : userId});

  let load = cart.products.map(product => product.productItems.map(productItems => Object.values(productItems)[1])); // 1 = load
  let qty = cart.products.map(product => product.productItems.map(productItems => Object.values(productItems)[2])); // 2 = quantity
  let productArray = cart.products.map(product => product.productId);
  
  let sumWithInitial;
  let result;
  let err;
  let array = [];

  for (let i = 0; i < load.length; i++) 
  {
    let emptyTable = [];
    let initialValue = 0;
    
    for (let j = 0; j < load[i].length; j++) 
    {
        emptyTable.push(load[i][j] * qty[i][j])
        sumWithInitial = emptyTable.reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          initialValue
        );
    }
    array.push(sumWithInitial);
    console.log(array);

    let cartProduct = await Product.findOne({_id: productArray[i]});
    let stockAvailable = cartProduct.countInStock;
    
    if(stockAvailable - sumWithInitial <= 0)
    {
      err = new Error('The stock for this product is not available : ' + cartProduct.title);
      err.status = 400;
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
  
    
  
}

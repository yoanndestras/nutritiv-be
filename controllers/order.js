const express = require('express');
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const mongoose = require('mongoose');

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
    
    let products =  cart.products;
    let amount =  cart.amount;
    
    let orderDetails = 
        {
            address: req.body.address,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
            phoneNumber: req.body.phoneNumber
        }
    
    const newOrder = new Order(
        {
            userId: mongoose.Types.ObjectId(userId),
            products: products,
            amount: amount,
            orderDetails: orderDetails,
        }
    );
    
    const savedOrder = await newOrder.save();
    req.order = savedOrder;
    next();
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

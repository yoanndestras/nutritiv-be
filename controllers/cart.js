const express = require('express');
const cart = require('../controllers/cart');
const Cart = require("../models/Cart");
const mongoose = require('mongoose');



exports.cart = async(req, res, next) => {
  
  const userId = req.user._id;
  const Id = req.body.productId;
  const Quantity = parseFloat(req.body.quantity);
  const Load = parseFloat(req.body.load);
  const Price = parseFloat(req.body.price);
  
  let price = parseFloat((Price * Quantity).toFixed(2))
  
  const existingCart = await Cart.findOne({userId : userId});
  const productsArray = existingCart ? existingCart.products : null;
  const productIndex = productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
  
  const newProduct = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id && el.productItems.some(el => el.load === Load)) : null;
  
  if (newProduct && newProduct.length > 0) 
  {
    const productAndLoadExist = cart.productAndLoadExist(userId, Quantity, price, Load, Id);
    next();
  }
  else if(productIndex !== null && productIndex !== -1)
  {
    const productExist = cart.productExist(userId, Quantity, price, Load, Id);
    next();
  }
  else if (existingCart)
  {
    const cartExist = cart.cartExist(userId, Quantity, price, Load, Id);
    next();
  }
  else
  {
    const newCart = cart.newCart(userId, Quantity, price, Load, Id);
    req.new = true;
    next();
  }
}

exports.productAndLoadExist = async(userId, Quantity, price, Load, Id) =>
{
  let updatedCart = await Cart.findOneAndUpdate(
    {"userId": userId},
    {
        $inc: {
            "products.$[outer].productItems.$[inner].quantity": Quantity,
            "products.$[outer].productItems.$[inner].price.value": price,
            "amount.value": price
        }
    },
    {
        arrayFilters: [
        {
            'outer.productId': mongoose.Types.ObjectId(Id)
        },
        {
            'inner.load': Load
        }],
        multi: true
    },
)
    
    let cart = await Cart.aggregate([
        { $match : {"userId" : userId} },
        {
            $project : {
                roundedValue:  
                {
                    $round : ["$amount.value", 2]
                }
            }
        }
    ])

    updatedCart = await Cart.findOneAndUpdate(
        {"userId": userId},
        {
            $set: {
                "amount.value": cart[0].roundedValue
            }
        }
    )
    return {updatedCart: updatedCart}
}

exports.productExist = async(userId, Quantity, price, Load, Id) =>
{
  let productItems =  
    {
        id: mongoose.Types.ObjectId(),
        load : Load, 
        quantity : Quantity,
        price : 
        {
            value : price,
            currency : "EUR"
        },
    }

  let updatedCart = await Cart.findOneAndUpdate(
    {"userId" : userId, "productId": mongoose.Types.ObjectId(Id)}, 
    {
        $push: {
            "products.$[].productItems": productItems,
        },
        $inc: {
            "amount.value": price
        }
    })

    let cart = await Cart.aggregate([
        { $match : {"userId" : userId} },
        {
            $project : {
                roundedValue:  
                {
                    $round : ["$amount.value", 2]
                }
            }
        }
    ])
    
    updatedCart = await Cart.findOneAndUpdate(
        {"userId": userId},
        {
            $set: {
                "amount.value": cart[0].roundedValue
            }
        }
    )
    return {updatedCart: updatedCart}
}

exports.cartExist = async(userId, Quantity, price, Load, Id) =>
{
  let productItems =  [
              {
                  id: mongoose.Types.ObjectId(),
                  load : Load, 
                  quantity : Quantity,
                  price : 
                      {
                          value : price,
                          currency : "EUR"
                      }
              }
          ]
  
  let newProduct = {productId : mongoose.Types.ObjectId(Id), productItems: productItems};
  
  updatedCart = await Cart.findOneAndUpdate(
      {"userId" : userId}, 
      {
          $push: 
          {
              products: newProduct
          },
          $inc: 
          {
              "amount.value": price
          }
      }
  )

  let cart = await Cart.aggregate([
      { $match : {"userId" : userId} },
      {
          $project : {
              roundedValue:  
              {
                  $round : ["$amount.value", 2]
              }
          }
      }
  ])

  updatedCart = await Cart.findOneAndUpdate(
      {"userId": userId},
      {
          $set: {
              "amount.value": cart[0].roundedValue
          }
      }
  )
  
  return {updatedCart: updatedCart}
}

exports.newCart = async(userId, Quantity, price, Load, Id) =>
{
  const newCart = new Cart(
    {
        userId: userId,
        products: 
        {
            productId : mongoose.Types.ObjectId(Id), 
            productItems: 
            [
                {
                    id: mongoose.Types.ObjectId(),
                    load : Load,
                    quantity : Quantity,
                    price : 
                    {
                        value : price,
                        currency : "EUR"
                    }
                }
            ]
        },
        "amount.value" : price,
        "amount.roundedValue": price
    }
);
return {newCart: newCart}
}
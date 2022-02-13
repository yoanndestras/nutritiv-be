const express = require('express');
const cart = require('../controllers/cart');
const Cart = require("../models/Cart");
const mongoose = require('mongoose');



// ADD TO CART
exports.cart = async(req, res, next) => 
{
try
{
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
        await cart.newCart(userId, Quantity, price, Load, Id);
        req.new = true;
        next();
    }
    }
    catch(err)
    {
    res.status(500).json(
        {
            success: false,
            status: "Unsuccessfull request!",
            err: err.message
        });
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
    const newCart = await new Cart(
    {
        userId: userId,
        products: 
        [{
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
        }],
        "amount.value" : price
    })
    await newCart.save();
}


// UPDATE QUANTITY IN CART
exports.updateQuantity = async(req, res, next) =>
{
    try
    {
    const userId = req.user._id;
    const Id = req.params.id;
    const Load = parseFloat(req.params.load);
    const Price = parseFloat(req.price);

    const quantity = req.params.operation === "inc" ? 1 : req.params.operation === "dec" ? -1 : null;
    const value = req.params.operation === "inc" ? Price : req.params.operation === "dec" ? - Price : null;

    if(quantity && value)
    {
        const operation = cart.operation(userId, quantity, value, Load, Id);
        const emptyCart = cart.emptyCart(userId, (await operation).updatedCart);
        const productQuantityIsZero = cart.productQuantityIsZero(userId, Load, Id);
        next();
    }
    else
    {
        res.status(500).json(
        {
            success: false,
            status: "This operation do not exist!"
        });
    }

    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
                err: err.message
            });
    }
        
}

exports.operation = async(userId, quantity, value, Load, Id) =>
{
    let incCart = await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $inc: {
                "products.$[outer].productItems.$[inner].quantity": quantity,
                "products.$[outer].productItems.$[inner].price.value": value,
                "amount.value": value
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
            new: true
        },
    );
    
    let aggregrateCart = await Cart.aggregate([
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
    
    let updatedCart = await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $set:
            {
                "amount.value" : aggregrateCart[0].roundedValue
            }
        })
    
    
    return {updatedCart}
}


exports.emptyCart = async(userId, updatedCart) => 
{
    let total = updatedCart ? await updatedCart.amount.value <=  0 : null;
    if(total)
    {
        await Cart.deleteOne({userId : userId})
    } 
}

exports.productQuantityIsZero = async(userId, Load, Id) =>
{
    const updatedCart = await Cart.findOne({userId : userId});
    const productsArray = updatedCart ? updatedCart.products : null; 
    const productIndex =  productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
    let product = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id) : null;
    
    product = product && product.length === 1 ? product[0].productItems.map(el => el.quantity === 0) : null
    
    let cartUpdate = product && product[0] === true ? await Cart.findOneAndUpdate(
    {userId : userId}, 
    {
        $pull: 
        {
            "products.$[outer].productItems": {load : Load} ,
        }
    },
    {
        arrayFilters: [
        {
            'outer.productId': mongoose.Types.ObjectId(Id)
        }],
        new: true
    },
    ): null;
    
    if(cartUpdate){await cartUpdate.save();}

    product = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id) : null;
    
    cartUpdate = product[0].productItems && product[0].productItems[0].quantity === 0 ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $pull: 
            {
                "products": {productId : mongoose.Types.ObjectId(Id)}
            }
        }
    ): null;
    
    if(cartUpdate){await cartUpdate.save();}
    
}

// DELETE PRODUCT IN CART

exports.deleteProductInCart = async(req, res, next) => 
{
try
{
    const userId = req.params.userId;
    const productId = req.params.productId;
    const Load = parseFloat(req.params.load);
    
    const existingCart = await Cart.findOne({userId : userId});
    const productsArray = existingCart ? existingCart.products : null;
    const productIndex =  productsArray ? productsArray.findIndex(el => el.productId.toString() === productId) : null;
    const product = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === productId && el.productItems.find(el => el.load === Load)) : null;
    
    const amount = product && product.length > 0 ? product[0].productItems[0].price.value : null;

    if(amount)
    {
        const deleteOperation = cart.deleteOperation(userId, Load, productId, amount);
        let total = deleteOperation.updatedCart ? await deleteOperation.updatedCart.amount.value ===  0 : null;

        if(total)
        {
        await Cart.deleteOne({userId : userId})
        next();
        }
        else
        {
        next();
        }
    }
    else
    {
        res.status(500).json(
        {
            success: false,
            status: "Unsuccessfull request!",
            err: "Product not found"
        });
    }
    }
    catch(err) 
    {
        res.status(500).json(
        {
            success: false,
            status: "Unsuccessfull request!"
        });
    }
    
}

exports.deleteOperation = async(userId, Load, productId, amount) =>
{
    let updatedCart = await Cart.findOneAndUpdate(
        {userId : userId},
        {
            $pull: 
                {
                    "products.$[outer].productItems" : {load : Load} 
                },
        },
        {
            arrayFilters: [
            {
                'outer.productId': mongoose.Types.ObjectId(productId)
            }
            ]
        },
    );

    await Cart.findOneAndUpdate(
        {userId : userId},
        {
            $inc: 
            {
                "amount.value": - amount
            }
        }
    );
    return {updatedCart}
}
const express = require('express');
const cart = require('../controllers/cart');
const mongoose = require('mongoose');
const Cart = require("../models/Cart");
const Product = require("../models/Product");



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
    
    let countInStock = await Product.findOne({_id: Id})
    
    let price = parseFloat((Price * Quantity).toFixed(2))
    
    const existingCart = await Cart.findOne({userId : userId});
    const productsArray = existingCart ? existingCart.products : null;
    const productIndex = productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
    
    const newProduct = productIndex !== null && productIndex !== -1 ? productsArray.filter(el => el.productId.toString() === Id && el.productItems.some(el => el.load === Load)) : null;

    if (newProduct !== null && newProduct.length > 0) 
    {
        cart.productAndLoadExist(userId, Quantity, price, Load, Id);
    }
    else if(productIndex !== null && productIndex !== -1)
    {
        cart.productExist(userId, Quantity, price, Load, Id);
    }
    else if (existingCart)
    {
        cart.cartExist(userId, Quantity, price, Load, Id);
    }
    else
    {
        await cart.newCart(userId, Quantity, price, Load, Id);
        req.new = true;
    }
    
    next();

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
    
    let cart = updatedCart ? await Cart.findOne({userId : userId}) : null;
    let currentAmount = cart ? cart.amount.value : null;
    let roundedValue = currentAmount ? currentAmount.toFixed(2) : null;
    
    let setRoundedValue = roundedValue ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $set:
            {
                "amount.value" : roundedValue
            }
        }) : null;
    
    return {updatedCart: setRoundedValue}
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
            "products.$[outer].productItems": productItems,
        },
        $inc: {
            "amount.value": price
        },
    },
    {
        arrayFilters: [
        {
            'outer.productId': mongoose.Types.ObjectId(Id)
        }],
        new: true
    },
    )

    let cart = updatedCart ? await Cart.findOne({userId : userId}) : null;
    let currentAmount = cart ? cart.amount.value : null;
    let roundedValue = currentAmount ? currentAmount.toFixed(2) : null;
    
    let setRoundedValue = roundedValue ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $set:
            {
                "amount.value" : roundedValue
            }
        }) : null;

    return {updatedCart: setRoundedValue}
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
    
    let cart = updatedCart ? await Cart.findOne({userId : userId}) : null;
    let currentAmount = cart ? cart.amount.value : null;
    let roundedValue = currentAmount ? currentAmount.toFixed(2) : null;
    
    let setRoundedValue = roundedValue ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $set:
            {
                "amount.value" : roundedValue
            }
        }) : null;

    return {updatedCart: setRoundedValue}
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
        
        if(quantity === 1)
        {
            const verifyStock = cart.verifyStock(userId, Id, Load);
            const error = (await verifyStock).err ? next((await verifyStock).err) : null;
        }
        
        if(quantity && value)
        {
            const operation = cart.operation(userId, quantity, value, Load, Id);
            const emptyCart = (await operation).setRoundedValue ? cart.emptyCart(userId, (await operation).setRoundedValue) : null;
            const productQuantityIsZero = (await emptyCart).total === false ? cart.productQuantityIsZero(userId, Load, Id, (await emptyCart).total) : null;
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
    const updatedCart = await Cart.findOne({userId : userId});
    const productsArray = updatedCart ? updatedCart.products : null; 
    const productIndex =  productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
    const currentProduct = productIndex !== null && productIndex !== -1 ? productsArray[productIndex].productItems : null;
    let findProduct = currentProduct ? currentProduct.findIndex(el => el.load === Load) : null;
    
    let incCart = findProduct !== null && findProduct !== -1 ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $inc: 
            {
                "products.$[outer].productItems.$[inner].quantity": quantity,
                "products.$[outer].productItems.$[inner].price.value": value,
                "amount.value" : value
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
    ) : null;
    
    let cart = incCart ? await Cart.findOne({userId : userId}) : null;
    let currentAmount = cart ? cart.amount.value : null;
    let roundedValue = currentAmount ? currentAmount.toFixed(2) : null;
    
    let setRoundedValue = roundedValue ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $set:
            {
                "amount.value" : roundedValue
            }
        }) : null;
    
    return {setRoundedValue}
}

exports.emptyCart = async(userId, setRoundedValue) => 
{
    let total = setRoundedValue ? await setRoundedValue.amount.value <=  0 : null;
    if(total){await Cart.deleteOne({userId : userId})};
    return {total}
}

exports.productQuantityIsZero = async(userId, Load, Id, emptyCart) =>
{
    if(emptyCart){return}
    else
    {
        const updatedCart = await Cart.findOne({userId : userId});
        const productsArray = updatedCart ? updatedCart.products : null; 
        const productIndex =  productsArray ? productsArray.findIndex(el => el.productId.toString() === Id) : null;
        const currentProduct = productIndex !== null && productIndex !== -1 ? productsArray[productIndex].productItems : null;
        let findProduct = currentProduct ? currentProduct.findIndex(el => el.quantity <= 0) : null;
        
        
        let pullProduct = findProduct !== null && findProduct !== -1 ? await Cart.findOneAndUpdate(
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
        if(pullProduct){await pullProduct.save();}
                
        let productExist = pullProduct ? (pullProduct.products[productIndex].productItems).length > 0 : null;
        
        pullProduct = productExist === false ? await Cart.findOneAndUpdate(
            {userId : userId}, 
            {
                $pull: 
                {
                    "products": {productId : mongoose.Types.ObjectId(Id)}
                }
            }
        ): null;
        
        if(pullProduct){await pullProduct.save();}
    }
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

exports.verifyStock = async(userId, productId, productLoad) => 
{
    
    const cart = await Cart.findOne({userId : userId});
    let findProductId = cart ? cart.products.find(el => el.productId.toString() === productId) : null;

    if(findProductId)
    {
        let load = findProductId.productItems.map(productItems => Object.values(productItems)[1]); // 1 = load
        let qty = findProductId.productItems.map(productItems => Object.values(productItems)[2]); // 2 = quantity
        

        let sumWithInitial;
        let err;
        let emptyTable = []
        
        for (let i = 0; i < load.length; i++) 
        {
            let initialValue = 0;
            
            emptyTable.push(load[i] * qty[i])
            sumWithInitial = emptyTable.reduce(
            (previousValue, currentValue) => previousValue + currentValue,
            initialValue
            );            
            
            let cartProduct = await Product.findOne({_id: productId});
            let stockAvailable = cartProduct.countInStock;
            
            if(stockAvailable - (sumWithInitial + productLoad) <= 0)
            {
                err = new Error('The stock for this product is not available : ' + cartProduct.title);
                err.status = 400;
            }
        }
        if(err)
        {
            return {err}
        }
        else
        {
            return
        }
    
    }
    else
    {
        err = new Error('Product not found');
        err.status = 400;
        return {err}
    }
}
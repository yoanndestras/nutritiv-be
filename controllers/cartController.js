const express = require('express');
const cart = require('./cartController');
const mongoose = require('mongoose');
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ADD TO CART
exports.cart = async(req, res, next) => 
{
    try
    {
        const {productId, quantity, load, price} = req.body;
        const userId = req.user._id, newProdId = productId; 
        const newProdQty = parseInt(quantity), newProdLoad = parseInt(load), newProdPrice = parseFloat(price);
        
        let calculatedPrice = parseFloat((newProdPrice * newProdQty).toFixed(2))
        
        const product = await Product.findOne({_id : newProdId}), existingCart = await Cart.findOne({userId : userId});
        const title = product.title, shape = product.shape, imgs = product.imgs;

        const cartProducts = existingCart?.products;
        const prodIndex = cartProducts ? cartProducts.findIndex(el => el.productId.toString() === newProdId) : null;
        const newProduct = prodIndex !== null && prodIndex !== -1 ? cartProducts[prodIndex].some(el => el.load === newProdLoad) : null;
        
        if(newProduct){cart.productAndLoadExist(userId, newProdQty, calculatedPrice, newProdLoad, newProdId);}
        else if(prodIndex !== null && prodIndex !== -1){cart.productExist(userId, newProdQty, calculatedPrice, newProdLoad, newProdId);}
        else if(existingCart){cart.cartExist(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId);}
        else{cart.newCart(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId);req.new = true;}
        
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

exports.productAndLoadExist = async(userId, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{
    let updatedCart = await Cart.findOneAndUpdate({"userId": userId},
    {
        $inc: {
            "products.$[outer].productItems.$[inner].quantity": newProdQty,
            "products.$[outer].productItems.$[inner].price.value": calculatedPrice,
            "amount.value": calculatedPrice,
            "totalQuantity" : newProdQty
        }
    },
    {
        arrayFilters: [
        {
            'outer.productId': mongoose.Types.ObjectId(newProdId)
        },
        {
            'inner.load': newProdLoad
        }],
        new: true,
    },)
    updatedCart = updatedCart.save()
    
    let roundedAmount = updatedCart?.amount?.value?.toFixed(2);
    let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;
    
    return {updatedCart: setRoundedValue}
}

exports.productExist = async(userId, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{
    let updatedCart = await Cart.findOneAndUpdate(
    {"userId" : userId, "productId": mongoose.Types.ObjectId(newProdId)}, 
    {
        $push: {
            "products.$[outer].productItems": 
            {
                id : mongoose.Types.ObjectId(),
                load : newProdLoad, 
                quantity : newProdQty,
                price : 
                {
                    value : calculatedPrice,
                    currency : "EUR"
                },
            },
        },
        $inc: {
            "amount.value": calculatedPrice,
            totalQuantity :newProdQty
        },
    },
    {
        arrayFilters: [
        {
            'outer.productId': mongoose.Types.ObjectId(newProdId)
        }],
        new: true,
    },
    )
    updatedCart = updatedCart.save()

    let roundedAmount = updatedCart?.amount?.value?.toFixed(2);    
    let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;

    return {updatedCart: setRoundedValue}
}

exports.cartExist = async(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{ 
    let updatedCart = await Cart.findOneAndUpdate(
        {"userId" : userId}, 
        {
            $push: 
            {
                products: 
                {
                    productId : mongoose.Types.ObjectId(newProdId), 
                    productTitle: title,
                    productImgs : imgs,
                    productShape: shape,
                    productItems: [
                        {
                            id: mongoose.Types.ObjectId(),
                            load : newProdLoad, 
                            quantity : newProdQty,
                            price : 
                                {
                                    value : calculatedPrice,
                                    currency : "EUR"
                                }
                        }
                    ]
                }
            },
            $inc: 
            {
                "amount.value": calculatedPrice,
                totalQuantity :newProdQty
            }
        }
    )

    updatedCart = updatedCart.save()

    let roundedAmount = updatedCart?.amount?.value?.toFixed(2); 
    let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;

    return {updatedCart: setRoundedValue}
}

exports.newCart = async(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{
    const newCart = await new Cart(
    {
        userId: userId,
        products: 
        [{
            productId : mongoose.Types.ObjectId(newProdId),
            productTitle: title,
            productImgs : imgs,
            productShape: shape,
            productItems: 
            [
                {
                    id: mongoose.Types.ObjectId(),
                    load : newProdLoad,
                    quantity : newProdQty,
                    price : 
                    {
                        value : calculatedPrice,
                        currency : "EUR"
                    }
                }
            ]
        }],
        totalQuantity: newProdQty,
        "amount.value" : calculatedPrice
    })
    await newCart.save();
}


// UPDATE QUANTITY IN CART
exports.updateQuantity = async(req, res, next) =>
{
    try
    {
        const userId = req.user._id, newProdId = req.params.id, newProdLoad = parseFloat(req.params.load), newProdPrice = parseFloat(req.price);

        const qty = req.params.operation === "inc" ? 1 : req.params.operation === "dec" ? -1 : null;
        const val = req.params.operation === "inc" ? newProdPrice : req.params.operation === "dec" ? - newProdPrice : null;
        
        if(!qty){res.status(500).json({success: false,status: "This operation do not exist, please enter inc or dec!"});}
        else if(qty === 1)
        {
            const verifyStock = cart.verifyStock(userId, newProdId, newProdLoad);
            const error = (await verifyStock).err ? next((await verifyStock).err) : null;
        }
        
        if(qty)
        {
            const operation = cart.operation(userId, qty, val, newProdLoad, newProdId);
            const emptyCart = (await operation).setRoundedValue ? cart.emptyCart(userId, (await operation).setRoundedValue) : null;
            const productQuantityIsZero = (await emptyCart).total === false ? cart.productQuantityIsZero(userId, newProdLoad, newProdId, (await emptyCart).total) : null;
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

exports.operation = async(userId, qty, val, newProdLoad, newProdId) =>
{
    const updatedCart = await Cart.findOne({userId : userId});
    const cartProducts = updatedCart?.products; 
    const prodIndex =  cartProducts ? cartProducts.findIndex(el => el.productId.toString() === newProdId) : null;
    const currentProduct = prodIndex !== null && prodIndex !== -1 ? cartProducts[prodIndex].productItems : null;
    let findProduct = currentProduct ? currentProduct.findIndex(el => el.load === newProdLoad) : null;
    
    let cartOperation = findProduct !== null && findProduct !== -1 ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {
            $inc: 
            {
                "products.$[outer].productItems.$[inner].quantity": qty,
                "products.$[outer].productItems.$[inner].price.value": val,
                "amount.value" : val,
                "totalQuantity" : qty
            }
        },
        {
            arrayFilters: [
            {
                'outer.productId': mongoose.Types.ObjectId(newProdId)
            },
            {
                'inner.load': newProdLoad
            }],
            new: true,
        },
    ) : null;
    
    cartOperation = cartOperation.save()
    
    let roundedAmount = cartOperation?.amount?.value?.toFixed(2); 
    let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;
    
    return {setRoundedValue}
}

exports.emptyCart = async(userId, setRoundedValue) => 
{
    let total = setRoundedValue ? (await setRoundedValue).amount.value <=  0 : null;
    if(total){await Cart.deleteOne({userId : userId})};
    return {total}
}

exports.productQuantityIsZero = async(userId, newProdLoad, newProdId, emptyCart) =>
{
    if(emptyCart){return}
    else
    {
        const updatedCart = await Cart.findOne({userId : userId});
        const cartProducts = updatedCart?.products; 
        const prodIndex =  cartProducts ? cartProducts.findIndex(el => el.productId.toString() === newProdId) : null;
        const currentProduct = prodIndex !== null && prodIndex !== -1 ? cartProducts[prodIndex].productItems : null;
        let findProduct = currentProduct ? currentProduct.findIndex(el => el.quantity <= 0) : null;
        
        
        let deleteProduct = findProduct !== null && findProduct !== -1 ? await Cart.findOneAndUpdate(
        {userId : userId}, 
        {$pull: {"products.$[outer].productItems": {load : newProdLoad} ,}},
        {arrayFilters: [{'outer.productId': mongoose.Types.ObjectId(newProdId)}],new: true,},): null;

        if(deleteProduct){await deleteProduct.save();}
        
        let productExist = deleteProduct ? (deleteProduct.products[prodIndex].productItems).length > 0 : null;
        deleteProduct = productExist === false ? await Cart.findOneAndUpdate(
            {userId : userId}, 
            {
                $pull: 
                {
                    "products": {productId : mongoose.Types.ObjectId(newProdId)}
                }
            }
        ): null;
        if(deleteProduct){await deleteProduct.save();}
    }
}

exports.verifyStock = async(userId, productId, productLoad) => 
{
    
    const cart = await Cart.findOne({userId : userId});
    let findProductId = cart ? cart.products.find(el => el.productId.toString() === productId) : null;

    if(findProductId)
    {
        let load = findProductId.productItems.map((productItems) => {return productItems.load;}); // 1 = load
        let qty = findProductId.productItems.map((productItems) => {return productItems.quantity;}); // 2 = quantity
        
        
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

// DELETE PRODUCT IN CART
exports.deleteProductInCart = async(req, res, next) => 
{
try
{
    const userId = req.params.userId;
    const productId = req.params.productId;
    const newProdLoad = parseFloat(req.params.load);
    let qty;
    let amount;

    const existingCart = await Cart.findOne({userId : userId});
    const cartProducts = existingCart?.products;
    const prodExist =  cartProducts ? await cartProducts.some(el => el.productId.toString() === productId) : null;
    
    let product = prodExist ? await cartProducts.filter((el) => 
    {
        if(el.productId.toString() === productId) 
        {
            let productItems = el.productItems.map((product) => 
            {
                if(product.load === newProdLoad)
                {
                    qty = product.quantity;
                    amount = product.price.value;
                    return qty
                }
            })
            return productItems 
        }
    }) : null;
    product = product.flat();
    if(amount)
    {
        const deleteOperation = cart.deleteOperation(userId, newProdLoad, qty, productId, amount);
        let total = (await deleteOperation).setRoundedValue ? (await deleteOperation).setRoundedValue.amount.value ===  0 : null;
        
        if(total)
        {
            await Cart.deleteOne({userId : userId})
            next();
        }
        else
        {
            let productExist = (await deleteOperation).setRoundedValue ? ((await deleteOperation).setRoundedValue.products[prodIndex].productItems).length > 0 : null;
            pullProduct = productExist === false ? await Cart.findOneAndUpdate(
                {userId : userId}, 
                {
                    $pull: 
                    {
                        "products": {productId : mongoose.Types.ObjectId(productId)}
                    }
                }
            ): null;
            if(pullProduct) {await pullProduct.save()}
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
            status: "Unsuccessfull request!",
            err: err.message
        });
    }
    
}

exports.deleteOperation = async(userId, newProdLoad, qty, productId, amount) =>
{
    let updatedCart = await Cart.findOneAndUpdate(
        {userId : userId},
        {
            $pull: 
                {
                    "products.$[outer].productItems" : {load : newProdLoad} 
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
    updatedCart = await Cart.findOneAndUpdate(
        {userId : userId},
        {
            $inc: 
            {
                "amount.value": - amount,
                "totalQuantity": - qty
            }
        }
    );
    if(updatedCart){await updatedCart.save();}
    
    let cart = updatedCart ? await Cart.findOne({userId : userId}) : null;
    let currentAmount = cart ? cart.amount.value : null;
    let roundedValue = currentAmount ||  currentAmount === 0 ? currentAmount.toFixed(2) : null;
    
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

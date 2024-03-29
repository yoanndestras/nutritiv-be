const cart = require('./cartController');

const appFunctions = require('../../app');

const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// ADD TO CART
exports.cart = async(req, res, next) => 
{
    try
    {
        const {productId, quantity, load, price} = req.body;
        const userId = req.user._id, newProdId = productId; 
        const newProdQty = parseFloat(quantity), newProdLoad = parseFloat(load), newProdPrice = parseFloat(price);

        let calculatedPrice = parseFloat((newProdPrice * newProdQty).toFixed(2))

        const product = await Product.findOne({_id : newProdId}), existingCart = await Cart.findOne({userId : userId});
        const title = product.title, shape = product.shape, imgs = product.imgs;

        const cartProducts = existingCart?.products;
        const prodIndex = cartProducts ? cartProducts.findIndex(el => el.productId.toString() === newProdId) : null;
        const newProduct = prodIndex !== null && prodIndex !== -1 ? cartProducts[prodIndex].productItems.some(el => el.load === newProdLoad) : null;
        
        if(newProduct){(await cart.productAndLoadExist(userId, newProdQty, calculatedPrice, newProdLoad, newProdId));}
        else if(prodIndex !== null && prodIndex !== -1){await (cart.productExist(userId, newProdQty, calculatedPrice, newProdLoad, newProdId));}
        else if(existingCart){(await cart.cartExist(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId));}
        else{await cart.newCart(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId);req.new = true;}
        
        next();
    }catch(err){next(err)}
}

exports.productAndLoadExist = async(userId, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{
    try
    {
        let updatedCart = await Cart.findOneAndUpdate({"userId": userId},
        {
            $inc: 
            {
                "products.$[outer].productItems.$[inner].quantity": newProdQty,
                "products.$[outer].productItems.$[inner].price.value": calculatedPrice,
                "totalQuantity" : newProdQty
            }
        },
        {
            arrayFilters: 
            [
                {
                    'outer.productId': appFunctions.ObjectId(newProdId)
                },
                {
                    'inner.load': newProdLoad
                }
            ],
            new: true,
        },)
        if(updatedCart){await updatedCart.save()};
    
        let roundedAmount = parseFloat((updatedCart?.amount?.value + calculatedPrice).toFixed(2));
        let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;
        if(await setRoundedValue){await setRoundedValue.save();}
        
        return {updatedCart: setRoundedValue}
    }catch(err){next(err)}
}

exports.productExist = async(userId, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{
    try
    {
        let updatedCart = await Cart.findOneAndUpdate(
        {"userId" : userId, "productId": appFunctions.ObjectId(newProdId)}, 
        {
            $push: 
            {
                "products.$[outer].productItems": 
                {
                    id : appFunctions.ObjectId(),
                    load : newProdLoad, 
                    quantity : newProdQty,
                    price : 
                    {
                        value : calculatedPrice,
                        currency : "EUR"
                    },
                },
            },
            $inc: 
            {
                "amount.value": calculatedPrice,
                totalQuantity : newProdQty
            },
        },
        {
            arrayFilters: 
            [
                {
                    'outer.productId': appFunctions.ObjectId(newProdId)
                }
            ],
            multi: true,
        },
        )
        if(updatedCart){await updatedCart.save()};
        
        let roundedAmount = parseFloat((updatedCart?.amount?.value + calculatedPrice).toFixed(2));  
        let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;
        if(await setRoundedValue){await setRoundedValue.save();}
    
        return {updatedCart: setRoundedValue}
    }catch(err){next(err)}
}

exports.cartExist = async(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{ 
    try
    {
        let updatedCart = await Cart.findOneAndUpdate(
            {userId : userId}, 
            {
                $push: 
                {
                    products: 
                    {
                        productId : appFunctions.ObjectId(newProdId), 
                        productTitle: title,
                        productImgs : imgs,
                        productShape: shape,
                        productItems: 
                        [
                            {
                                id: appFunctions.ObjectId(),
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
                    totalQuantity : newProdQty
                },
                multi: true,
            }
        )
        if(updatedCart){await updatedCart.save()};
        
        let roundedAmount =  parseFloat((updatedCart?.amount?.value + calculatedPrice).toFixed(2));
        let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;
        if(setRoundedValue){await setRoundedValue.save()};
        
        return {updatedCart: await setRoundedValue}
    }catch(err){next(err)}
}

exports.newCart = async(userId, title, shape, imgs, newProdQty, calculatedPrice, newProdLoad, newProdId) =>
{
    try
    {
        const newCart = await new Cart(
        {"userId": userId,
            products: 
            [{
                productId : appFunctions.ObjectId(newProdId),
                productTitle: title,
                productImgs : imgs,
                productShape: shape,
                productItems: 
                [
                    {
                        id: appFunctions.ObjectId(),
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
        if(newCart){await newCart.save();}
    }catch(err){next(err)}
}


// UPDATE QUANTITY IN CART
exports.updateQuantity = async(req, res, next) =>
{
    try
    {
        const userId = req.user._id, newProdId = req.params.productId, newProdLoad = parseFloat(req.params.load), newProdPrice = parseFloat(req.price);
        const qty = req.params.operation === "inc" ? 1 : req.params.operation === "dec" ? -1 : null;
        const val = req.params.operation === "inc" ? newProdPrice : req.params.operation === "dec" ? - newProdPrice : null;
        
        if(!qty){let err = new Error("Operation do not exist");err.Statuscode = 403; next(err);}
        else if(qty === 1)
        {
            const verifyStock = (await cart.verifyStock(userId, newProdId, newProdLoad));
            if(verifyStock.err){next(verifyStock.err)};
        }
        
        if(qty)
        {
            const operation = (await cart.operation(userId, qty, val, newProdLoad, newProdId));
            const emptyCart = operation.setRoundedValue ? (await cart.emptyCart(userId, operation.setRoundedValue)) : null;
            const productQuantityIsZero = emptyCart.total === false ? (await cart.productQuantityIsZero(userId, newProdLoad, newProdId, emptyCart.total)) : null;
            if(productQuantityIsZero || emptyCart){next()};
        }
    }catch(err){next(err)}
}

exports.operation = async(userId, qty, val, newProdLoad, newProdId) =>
{
    try
    {
        const updatedCart = await Cart.findOne({userId : userId}), cartProducts = updatedCart?.products; 
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
                    "totalQuantity": qty,
                }
            },
            {
                arrayFilters: [
                {
                    'outer.productId': appFunctions.ObjectId(newProdId)
                },
                {
                    'inner.load': newProdLoad
                }],
                new: true,
            },
        ) : null;
        if(cartOperation){await cartOperation.save();}
        let roundedAmount =  parseFloat((cartOperation?.amount?.value + val).toFixed(2));
        let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount}}) : null;
        if(setRoundedValue){await setRoundedValue.save();}
    
        return {setRoundedValue}
    }catch(err){next(err)}
}

exports.emptyCart = async(userId, setRoundedValue) => 
{
    try
    {
        let total = setRoundedValue ? (await setRoundedValue).amount.value <=  0 : null;
        if(total){await Cart.deleteOne({userId : userId})};
        return {total}
    }catch(err){next(err)}
}

exports.productQuantityIsZero = async(userId, newProdLoad, newProdId, emptyCart) =>
{
    try
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
            {arrayFilters: [{'outer.productId': appFunctions.ObjectId(newProdId)}],new: true,},): null;
    
            if(deleteProduct){await deleteProduct.save();}
            
            let productExist = deleteProduct ? (deleteProduct.products[prodIndex].productItems).length > 0 : null;
            deleteProduct = productExist === false ? await Cart.findOneAndUpdate(
                {userId : userId}, 
                {
                    $pull: 
                    {
                        "products": {productId : appFunctions.ObjectId(newProdId)}
                    }
                }
            ): null;
            if(deleteProduct){await deleteProduct.save();}
        }
    }catch(err){next(err)}
}

exports.verifyStock = async(userId, productId, productLoad) => 
{
    try
    {
        const cart = await Cart.findOne({userId : userId});
        let findProductId = cart ? cart.products.find(el => el.productId.toString() === productId) : null;
    
        if(findProductId)
        {
            let load = findProductId.productItems.map((productItems) => {return productItems.load;}); // 1 = load
            let qty = findProductId.productItems.map((productItems) => {return productItems.quantity;}); // 2 = quantity
            
            let sumWithInitial, err, emptyTable = [];
            
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
                    err.statusCode = 403;
                }
            }
            if(err){return {err}}
            else{return}
        }
        else
        {
            let err = new Error('Product not found');
            err.statusCode = 400;
            return {err}
        }
    }catch(err){next(err)}
}

// DELETE PRODUCT IN CART
exports.deleteProductInCart = async(req, res, next) => 
{
    try
    {
        const userId = req.params.userId, productId = req.params.productId, newProdLoad = parseFloat(req.params.load);
        let qty, amount;

        const existingCart = await Cart.findOne({userId : userId}), cartProducts = existingCart?.products;
        const prodExist =  cartProducts ? await cartProducts.some(product => product.productId.toString() === productId) : null;
        
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
        // if(product){product = product.flat()};
        
        if(!amount)
        {
            let err = new Error('Product not found!')
            err.statusCode = 400;
            return next(err);
        }
        else
        {
            const deleteOperation = (await cart.deleteOperation(userId, newProdLoad, qty, productId, amount));
            let total = deleteOperation.setRoundedValue ? deleteOperation.setRoundedValue.amount.value <=  0 : null;

            if(total){await Cart.deleteOne({userId : userId}); next();}
            else
            {
                let prodIndex = deleteOperation.setRoundedValue.products.findIndex(product => product.productId.toString() === productId)
                let productExist = deleteOperation.setRoundedValue ? (deleteOperation.setRoundedValue.products[prodIndex].productItems).length > 0 : null;
                let pullProduct = productExist === false ? await Cart.findOneAndUpdate(
                    {userId : userId}, 
                    {
                        $pull: 
                        {
                            "products": {productId : appFunctions.ObjectId(productId)}
                        }
                    }
                ): null;
                if(pullProduct) {await pullProduct.save()}
                next();
            }
        }
    }catch(err){next(err)}
}

exports.deleteOperation = async(userId, newProdLoad, qty, productId, amount) =>
{
    try
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
                    'outer.productId': appFunctions.ObjectId(productId)
                }
                ]
            },
        );
        if(updatedCart){await updatedCart.save();}
        
        let roundedAmount =  parseFloat((updatedCart?.amount?.value - amount).toFixed(2));
        let roundedTotalQty = parseInt((updatedCart?.totalQuantity - qty));
        let setRoundedValue = roundedAmount ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount, "totalQuantity" : roundedTotalQty}}) : null;
    
        if(await setRoundedValue){await setRoundedValue.save();}
        
        return {setRoundedValue}
    }catch(err){next(err)}
}

// DELETE PRODUCT IN CART
exports.deleteProductInCartById = async(req, res, next) => 
{
    try
    {
        const userId = req.params.userId, productId = req.params.productId, newProdId = req.params.id;
        let qty, amount, load;

        const existingCart = await Cart.findOne({userId : userId}), cartProducts = existingCart?.products;
        const prodExist =  cartProducts ? await cartProducts.some(product => product.productId.toString() === productId) : null;
        
        prodExist && await cartProducts.filter((el) => 
        {
            if(el.productId.toString() === productId) 
            {
                let productItems = el.productItems.map((product) => 
                {
                    if(product.id.toString() === newProdId)
                    {
                        qty = product.quantity;
                        amount = product.price.value;
                        load = product.load;
                        return qty
                    }
                })
                return productItems 
            }
        });
        // if(product){product = product.flat()};
        
        if(!amount)
        {
            let err = new Error('Product not found!')
            err.statusCode = 400;
            return next(err);
        }
        else
        {
            const deleteOperation = (await cart.deleteOperationById(userId, load, qty, productId, amount));
            let total = deleteOperation.setRoundedValue ? deleteOperation?.setRoundedValue?.amount?.value <=  0 : null;
            if(total){await Cart.deleteOne({userId : userId}); next();}
            else
            {
                let prodIndex = deleteOperation.setRoundedValue.products.findIndex(product => product.productId.toString() === productId)
                let productExist = deleteOperation.setRoundedValue ? (deleteOperation.setRoundedValue.products[prodIndex].productItems).length > 0 : null;
                let pullProduct = productExist === false ? await Cart.findOneAndUpdate(
                    {userId : userId}, 
                    {
                        $pull: 
                        {
                            "products": {productId : appFunctions.ObjectId(productId)}
                        }
                    }
                ): null;
                if(pullProduct) {await pullProduct.save()}
                next();
            }
        }
    }catch(err){next(err)}
}

exports.deleteOperationById = async(userId, load, qty, productId, amount) =>
{
    try
    {
        let updatedCart = await Cart.findOneAndUpdate(
            {userId : userId},
            {
                $pull: 
                    {
                        "products.$[outer].productItems" : {load : load} 
                    },
            },
            {
                arrayFilters: [
                {
                    'outer.productId': appFunctions.ObjectId(productId)
                }
                ]
            },
        );
        
        let roundedAmount =  parseFloat((updatedCart?.amount?.value - amount).toFixed(2));
        let roundedTotalQty = parseInt((updatedCart?.totalQuantity - qty));
        let setRoundedValue = roundedAmount !== null && roundedTotalQty !== null ? await Cart.findOneAndUpdate({userId : userId}, {$set:{"amount.value" : roundedAmount, totalQuantity : roundedTotalQty}}) : null;
        
        let cart = await Cart.findOne({userId : userId});
        await cart.save();
        
        setRoundedValue = cart;
        return {setRoundedValue}
    }catch(err){next(err)}
}


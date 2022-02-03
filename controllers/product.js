
const Product = require("../models/Product");

exports.discount = (values, price, el, keys) => {
    
    const output = keys.reduce((prev, curr) => Math.abs(curr - el) < Math.abs(prev - el) ? curr : prev);
    let Index = keys.indexOf(output);
    
    let discountedPrice = price - price * (values[Index]);
    price = Math.round(discountedPrice) - 0.01;
    qty = parseFloat(el), price = parseFloat(price);
    
    return {qty, price}
}

exports.verifyProduct = async(req, res, next) => {
    
    const newProductId = req.body.productId;
    const newProductLoad = parseFloat(req.body.load);
    const newProductPrice = parseFloat(req.body.price);

    const existingProduct = await Product.findById(newProductId);
    let productId = existingProduct ? existingProduct._id : null;
    let productArray = productId ? existingProduct.product : null;
    
    let productLoadAndPrice = productArray ? (existingProduct.product).map((el, i) => {if(el.load === newProductLoad && el.price.value === newProductPrice) {return el.load}}) : null;
    let productQuantityInStock = existingProduct ? existingProduct.countInStock >= newProductLoad ? true : false : null;
    productLoadAndPrice = productLoadAndPrice ? productLoadAndPrice.filter(el => el !== undefined) : null;
    
    
    if(Array.isArray(productLoadAndPrice) && productLoadAndPrice[0] && productId && productQuantityInStock)
    {
        next();
    }
    else if(productQuantityInStock === false)
    {
        let err = new Error("Not enough quantity of the product");
        err.status = 403;
        return next(err);
    }
    else
    {
        console.log("object");
        let err = new Error('Id : ' + newProductId + ', Val : ' + newProductLoad + ", Price : " + newProductPrice + " doesnt exist");
        err.status = 403;
        return next(err);
    }
}

exports.verifyPricePerProduct = async(req, res, next) => {
    
    const newProductId = req.params.id;
    const newProductLoad = parseFloat(req.params.load);
    
    const existingProduct = await Product.findById(newProductId);
    let productId = existingProduct ? existingProduct._id : null;
    let productArray = productId ? existingProduct.product : null;

    let productPrice = productArray ? (existingProduct.product).map((el, i) => {if(el.load === newProductLoad) {return el.price.value}}) : null;
    let productQuantityInStock = existingProduct ? existingProduct.countInStock >= newProductLoad ? true : false : null;
    productPrice = productPrice ? productPrice.filter(el => el !== undefined) : null;
    
    
    if(Array.isArray(productPrice) && productPrice[0] && productId && productQuantityInStock)
    {
        req.price = productPrice
        next();
    }
    else if(productQuantityInStock === false)
    {
        let err = new Error("Not enough quantity in stock for this new product");
        err.status = 403;
        return next(err);
    }
    else
    {
        let err = new Error('Id : ' + newProductId + ' Val : ' + newProductLoad + " doesnt exist");
        err.status = 403;
        return next(err);
    }
}

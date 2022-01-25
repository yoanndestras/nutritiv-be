
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
    const newProductVal = parseFloat(req.body.load);
    const newProductPrice = parseFloat(req.body.price);
    
    const existingProduct = await Product.findById(newProductId);
    let productId = existingProduct ? existingProduct._id : null;
    let productArray = productId ? existingProduct.product : null;
    
    let productLoadAndPrice = productArray ? (existingProduct.product).map((el, i) => {if(el.load === newProductVal && el.price === newProductPrice) {return el.load}}) : null;
    let productQuantityInStock = existingProduct ? existingProduct.countInStock >= newProductVal ? true : false : null;
    productLoadAndPrice = productLoadAndPrice ? productLoadAndPrice.filter(el => el !== undefined) : null;
    
    console.log(productArray);
    console.log(productLoadAndPrice);
    console.log(productQuantityInStock);
    console.log(productId);
    
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
        let err = new Error('Id : ' + newProductId + ' Val : ' + newProductVal + " Price : " + newProductPrice + " doesnt exist");
        err.status = 403;
        return next(err);
    }
}


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
    const newProductVal = parseFloat(req.body.val);
    const newProductPrice = parseFloat(req.body.price);
    
    const existingProductId = await Product.findById(newProductId);

    let productId = existingProductId._id;
    let productValAndPrice = (existingProductId.load).map((el, i) => {if(el.val === newProductVal && el.price === newProductPrice) {return el.val}});
    let productQuantityInStock = existingProductId.countInStock >= newProductVal ? true : false
    productValAndPrice = productValAndPrice.filter(el => el !== undefined)

    console.log(productValAndPrice);
    console.log(productQuantityInStock);
    console.log(productId);
    
    if(productValAndPrice[0] && productId && productQuantityInStock)
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
        let err = new Error('Val : ' + newProductVal + " Price : " + newProductPrice + " doesnt exist");
        err.status = 403;
        return next(err);
    }
}

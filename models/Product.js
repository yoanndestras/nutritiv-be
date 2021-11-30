const mongoose = require("mongoose")
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const ProductSchema = new Schema
({
    title: 
    {
        type: String,
        required: true,
        unique: true
    },
    desc: 
    {
        type: String,
        required: true
    },
    img: 
    {
        type: String,
        required: true
    },
    tags: 
    {
        type: Array,
        required: true
    },
    shape: 
    {
        type: Array,
        required: true
    },
    load: 
    {
        type: Array,
        required: true
    },
    price:
    {
        type: Array, Currency,
        required: true,
        min: 0
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
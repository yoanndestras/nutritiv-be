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
        unique: false
    },
    desc: 
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
        type: String,
        required: true,
        unique: true
    },
    imgs: 
    {
        type: String,
        type: Array,
        required: true
    },
    product: 
    {
        type: Array,
        required: true,
        load:
        {
            type: Number,
            required: true
        },
        price:
        {
            type: Currency,
            required: true,
            min: 0
        },
    },
    countInStock:
    {
        type: Number,
        required: true
    }
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
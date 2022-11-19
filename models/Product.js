const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

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
    category: 
    {
        type: String,
        required: true
    },
    shape: 
    {
        type: String,
        required: true
    },
    imgs: 
    {
        type: Array,
        default: [],
    },
    productItems: 
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
            value:
            { 
                type: Number,
                required: true,
                min: 0
            },
            currency:
            {
                type: String,
                default: 'EUR'
            }
        },
    },
    countInStock:
    {
        type: Number,
        required: true
    },
    version: 
    {
        type: Number,
        immutable: true,
        default: 1,
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
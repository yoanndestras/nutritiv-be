const mongoose = require("mongoose")
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const CartSchema = new Schema
({
    userId: 
    {
        type: String,
        required: true,
    },
    products:
    {
        type: Array,
        required: true,
        productId:
        {
            type: String,
            required: true
        },
        load: 
        {
            type: Array,
            required: true,
            val:
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
            quantity:
            {
                type: Number,
                default: 1,
                required: true
            },
        }
    },
    
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
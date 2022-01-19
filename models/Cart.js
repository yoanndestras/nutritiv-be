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
        quantity:
        {
            type: Number,
            default: 1,
            required: true
        },
        load: 
        [
            {
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
            }
        ],
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
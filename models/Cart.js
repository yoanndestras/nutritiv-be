const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const CartSchema = new Schema
({
    userId: 
    {
        type: String,
        required: true,
    },
    products: 
    [
        {
            productId:
            {
                type: String
            },
            quantity:
            {
                type: Number,
                default: 1,
            },
        },
    ],
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const Currency = mongoose.Types.Currency;


const OrderSchema = new Schema
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
    amount:
    {
        type: Currency,
        required: true,
        min: 0
    },
    address:
    {
        type: Currency,
        required: true,
        min: 0
    },
    status:
    {
        type: String,
        default: "pending"
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
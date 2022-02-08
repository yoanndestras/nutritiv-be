const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const OrderSchema = new Schema
({
    userId: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
    },
    products: 
    {
        type: Array,
        ref: "Cart",
        required: true
    },
    amount: 
    {
        type: Object,
        ref: "Cart",
        required: true
    },
    address:
    {
        type: String,
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
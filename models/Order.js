const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const OrderSchema = new Schema
({
    Cart: 
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    amount: 
    {
        value :
        { 
            type: Number,
            required: true
        },
        currency:
        {
            type: String,
            default: 'EUR'
        }
    },
    address:
    {
        type: String,
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
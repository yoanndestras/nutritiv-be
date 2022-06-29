const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const OrderSchema = new Schema
({
    userId: 
    {
        type: ObjectId,
        required: true
    },
    products: 
    {
        type: Array,
        required: true
    },
    amount: 
    {
        type: Object,
        required: true
    },
    orderDetails:
    [
        {
            street:
            {
                type: String,
                required: true
            },
            zip:
            {
                type: Number,
                required: true
            },
            city:
            {
                type: String,
                required: true
            },
            country:
            {
                type: String,
                required: true
            },
            // phoneNumber:
            // {
            //     type: Number,
            //     required: true
            // }
        }
    ],
    status:
    {
        type: String,
        default: "pending"
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


let Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
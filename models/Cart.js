const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const CartSchema = new Schema (
{
    userId: 
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    products:
    {
        type: Array,
        required: true,
        productId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        productTitle:
        {
            type: String,
            required: true
        },
        productImgs:
        {
            type: String,
            type: Array,
            required: true
        },
        productShape:
        {
            type: String,
            required: true
        },
        productItems: 
        [
            {
                id:
                {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                load:
                {
                    type: Number,
                    required: true
                },
                quantity:
                {
                    type: Number,
                    default: 1,
                    min: 0,
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
            }
        ]
    },
    totalQuantity:
    {
        type: Number,
        default: 1,
        min: 0,
        required: true
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
    version: 
    {
        type: Number,
        immutable: true,
        default: 2,
    },
},
{
timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});


let Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
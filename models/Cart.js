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
    {
        type: Array,
        required: true,
        productId:
        {
            type: String,
            required: true
        },
        productItems: 
        {
            type: Array,
            required: true,
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
            price:
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
            quantity:
            {
                type: Number,
                default: 1,
                required: true
            },
        }
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
    }
    
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
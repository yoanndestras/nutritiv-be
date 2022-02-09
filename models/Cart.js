const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const CartSchema = new Schema
({
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
            quantity:
            {
                type: Number,
                default: 1,
                min: 0,
                required: true
            },
        }
    ]
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
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const reviewSchema = new Schema
({
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
},
{
    timestamps: true,
}
);


const articleSchema = new Schema
({
    name: 
    {
        type: String,
        required: true,
        unique: true
    },
    seller:
    {
        type: String,
        required: true
    },
    image: 
    {
        type: String,
        require: true
    },
    brand: 
    {
        type: String,
        require: true
    },
    category:
    {
        type: String,
        required: true
    },
    description: 
    {
        type: String,
        require: true
    },
    price:
    {
        type: Currency,
        required: true,
        min: 0
    },
    countInStock: 
    {
        type: Number,
        require: true
    },
    rating: 
    {
        type: Number,
        require: true
    },
    numReviews: 
    {
        type: Number,
        require: true
    },
    reviews: [reviewSchema],
    
},
{
    timestamps: true
});


let Articles = mongoose.model('Dish', articleSchema);

module.exports = Articles;
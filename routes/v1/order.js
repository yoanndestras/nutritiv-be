const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const router = require("express").Router();
const mongoose = require('mongoose');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const order = require('../../controllers/v1/ordersController')
const mailer = require("../../controllers/v1/mailerController");

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


// GET USER ORDERS
router.get("/find/:userId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAuthorization, async (req, res, next) =>
{
    try
    {
        const orders = await Order.find({userId: req.params.userId}).lean();
        res.status(200).json(orders);
    }catch(err){next(err)}
});

// GET ALL ORDERS
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
async (req, res, next) =>
{
    try
    {
        const orders = await Order.find().lean();
        res.status(200).json(orders);
    }catch(err){next(err)}

});

// GET MONTHLY INCOME
router.get("/income", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
async (req, res, next) =>
{
    const date = new Date();
    // 1 month ago
    const lastMonth = new Date(date.setMonth(date.getMonth() -1));
    // 2 months ago
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() -1));
        
    try
    {
        const income = await Order.aggregate(
            [
                {
                    $match: 
                    { //condition : greater than previousMonth
                        createdAt: {$gte: previousMonth }
                    },
                },
                {
                    $project :
                    { // create the month value for the _id output of data
                        month: {$month: "$createdAt"},
                        sales: "$amount",
                    },
                },
                {
                    $group:
                    {
                        _id: "$month",
                        // sum every orders income
                        total: { $sum: "$sales"},
                    },
                },
            ]);
        res.status(200).json(income);
    }catch(err){next(err)}
});

// CREATE ORDER
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
order.newOrder, async (req, res, next) =>
{    
    try
    {
        setTimeout(() => {mailer.sendNewOrder(req, res, next);}, 5000);
        setTimeout(() => {mailer.orderShipping(req, res, next);}, 15000);
        setTimeout(() => {mailer.orderDelivered(req, res, next);}, 25000);

        if(req.cart === true)
        {
            res.status(200).json(
                {
                    success: true,
                    status: req.user.username + ", thank you for your order",
                    newOrder: req.order
                }
            );
        }
        else if (req.cart === false)
        {
            res.status(400).json(
                {
                    success: false,
                    status: "Cart do not exist!"
                }
            );
        }
        
    }catch(err){next(err)}
});

// UPDATE ORDER STATUS
router.put("/status", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async(req, res, next) =>
{
    try
    {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            {
                $set: req.body
            },
            {new: true}
        );
        res.status(201).json(updatedOrder);
    }catch(err){next(err)}
});

// DELETE ORDER
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async (req, res, next) =>
{
    try
    {
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json("Order has been deleted...")
    }catch(err){next(err)}
});


module.exports = router;
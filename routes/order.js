const Order = require("../models/Order");
const Cart = require("../models/Cart");
const router = require("express").Router();
const mongoose = require('mongoose');

// MIDDLEWARES
const cors = require('../controllers/corsController');
const auth = require('../controllers/authController');
const order = require('../controllers/ordersController')

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE ORDER
router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, order.verifyPhoneNumber, order.newOrder, async (req, res) =>
{    
    try
    {
        if(req.cart === true)
        {
            res.status(200).json(
                {
                    success: true,
                    status: req.user.username + ", thank you for your order",
                    NewOrder: req.order
                }
            );
        }
        else if (req.cart === false)
        {
            res.status(500).json(
                {
                    success: false,
                    status: "Cart do not exist!"
                }
            );
        }
        
    }
    catch(err)
    {
        res.status(500).json(
            {
                success: false,
                status: "Unsuccessfull request!",
                err : err.message
            }
        );
    }
});

// UPDATE ORDER
router.put("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async(req, res) =>
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

        res.status(200).json(updatedOrder);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

// DELETE ORDER
router.delete("/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
{
    try
    {
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json("Order has been deleted...")
    }
    catch(err)
    {
        res.status(500).json(err);
    }

});

// GET USER ORDERS
router.get("/find/:id", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAuthorization, async (req, res) =>
{
    try
    {
        const orders = await Order.find({userId: req.params.id})
        res.status(200).json(orders);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

// GET ALL ORDERS
router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
{
    try
    {
        //method to get all orders
        const orders = await Order.find();
        
        res.status(200).json(orders);
    }
    catch(err)
    {
        res.status(500).json(err);
    }

});

// GET MONTHLY INCOME
router.get("/income", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, async (req, res) =>
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
    }
    catch(err)
    {
        res.status(500).json(err);
    }

});


module.exports = router;
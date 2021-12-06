const Order = require("../models/Order");
const authenticate = require('./tokenAuth');
const router = require("express").Router();

// CREATE ORDER
router.post("/", authenticate.verifyToken, async (req, res) =>
{
    const newOrder = new Order(req.body);
    try
    {
        const savedOrder = await newOrder.save();
        
        res.status(200).json(savedOrder);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

// UPDATE ORDER
router.put("/:id", authenticate.verifyTokenAndAdmin, async(req, res) =>
{
    try
    {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            {
                $set: req.body
            },
            {new: true});

        res.status(200).json(updatedOrder);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

// DELETE ORDER
router.delete("/:id", authenticate.verifyTokenAndAdmin, async (req, res) =>
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
router.get("/find/:userId", authenticate.verifyTokenAndAuthorization, async (req, res) =>
{
    try
    {
        const orders = await Order.find({userId: req.params.userId})
        res.status(200).json(orders);
    }
    catch(err)
    {
        res.status(500).json(err);
    }

});

// GET ALL ORDERS
router.get("/", authenticate.verifyTokenAndAdmin, async (req, res) =>
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
router.get("/income", authenticate.verifyTokenAndAdmin, async (req, res) =>
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
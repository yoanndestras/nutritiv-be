const Cart = require("../models/Cart");
const router = require("express").Router();

// MIDDLEWARES
const cors = require('../controllers/cors');
const authenticate = require('../controllers/authenticate');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// CREATE CART
router.post("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, async (req, res) =>
{
    const newCart = new Cart(req.body);
    try
    {
        const savecCart = await newCart.save();
        
        res.status(200).json(savecCart);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
})
// UPDATE CART
router.put("/:id", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAuthorization, async(req, res) =>
{
    try
    {
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id, 
            {
                $set: req.body
            },
            {new: true});

        res.status(200).json(updatedCart);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
})

// DELETE CART
router.delete("/:id", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAuthorization, async (req, res) =>
{
    try
    {
        await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json("Cart has been deleted...")
    }
    catch(err)
    {
        res.status(500).json(err);
    }

})

// GET USER CART
router.get("/find/:userId", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAuthorization, async (req, res) =>
{
    try
    {
        const cart = await Cart.findOne({userId: req.params.userId})
        res.status(200).json(cart);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
})

// GET ALL 
router.get("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyRefresh, authenticate.verifyAdmin, async (req, res) =>
{
    try
    {
        const carts = await Cart.find();
        res.status(200).json(carts);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
})

module.exports = router;
const express = require('express');
const cart = require('../db/db').cart;

const cartRouter = express.Router();

async function verifyUserCart(req, res, next) {
    const cartId = Number(req.params.cartId);

    if(!cartId) {
        const error = new Error('Please input a number for cart ID');
        error.status = 400;
        return next(error);
    }

    if(!req.session.passport?.user) {
        const error = new Error("Please log in to view a User's cart!");
        error.status = 401;
        return next(error);
    }

    await cart.getUserForCart(cartId, (err, userId) => {
        if(err) return next(err);
        
        if(req.session.passport.user != userId) {
            console.log(req.session.passport.user);
            console.log(userId);
            const error = new Error("You do not have permission to view cart with that ID!");
            error.status = 403;
            return next(error);
        }
        req.cartId = cartId;

        next();
    });
}

cartRouter.get('/:cartId', verifyUserCart, async (req, res, next) => {

    await cart.getCartById(req.cartId, (err, results) => {
        if(err) return next(err);
        res.json(results);
    });
});

cartRouter.post('/', (req, res, next) => {
    //Implement Post to add items to user's cart
});

cartRouter.put('/', (req, res, next) => {
    //Implement Put to edit item quantity in user's cart
});

cartRouter.delete('/', (req, res, next) => {
    //Implement Delete to remove items from user's cart
});

cartRouter.post('/checkout', (req, res, next) => {
    //Implement Post to checkout a user
});

module.exports = cartRouter;
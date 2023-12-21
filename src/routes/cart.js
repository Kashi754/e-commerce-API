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

    await cart.getCartById(req.cartId, (err, cart) => {
        if(err) return next(err);
        res.json(cart);
    });
});

cartRouter.post('/', async (req, res, next) => {
    const userId = req.session.passport.user;
    const itemData = req.body;

    await cart.addItemToCart(userId, itemData, async (err, cartId) => {
        if(err) return next(err);

        await cart.getCartById(cartId, (err, cart) => {
            if(err) return next(err);
            res.json(cart);
        });
    });
});

cartRouter.put('/', async (req, res, next) => {
    const userId = req.session.passport.user;
    const itemData = req.body;

    await cart.editCartProduct(userId, itemData, async (err, cartId) => {
        if(err) return next(err);

        await cart.getCartById(cartId, (err, cart) => {
            if(err) return next(err);
            res.json(cart);
        });
    })
});

cartRouter.delete('/', async (req, res, next) => {
    const userId = req.session.passport.user;
    const productId = Number(req.query.product_id);

    if(!productId) {
        const error = new Error('Please input a number for the product ID!');
        error.status = 400;
        return next(error);
    }

    await cart.deleteCartProduct(userId, productId, async (err, cartId) => {
        if(err) return next(err);

        await cart.getCartById(cartId, (err, cart) => {
            if(err) return next(err);
            res.json(cart);
        });
    });
});

cartRouter.post('/checkout', (req, res, next) => {
    //Implement Post to checkout a user
});

module.exports = cartRouter;
const express = require('express');
const cart = require('../db/db').cart;

const cartRouter = express.Router();

async function verifyUserCart(req, res, next) {
    const cartId = Number(req.params.cartId) || req.user.cartId;

    if(!cartId) {
        const error = new Error('Please input a number for cart ID');
        error.status = 400;
        return next(error);
    }

    await cart.getUserForCart(cartId, (err, userId) => {
        if(err) return next(err);
        
        if(req.user.id != userId && req.user.role !== 'admin') {
            const error = new Error("You do not have permission to interact with cart with that ID!");
            error.status = 403;
            return next(error);
        }
        
        req.cartId = cartId;

        next();
    });
}

cartRouter.get('/', verifyUserCart, async (req, res, next) => {
    await cart.getCartById(req.cartId, (err, cart) => {
        if(err) return next(err);
        res.json(cart);
    });
});

cartRouter.post('/', verifyUserCart, async (req, res, next) => {
    const itemData = req.body;

    await cart.addItemToCart(req.cartId, itemData, async (err) => {
        if(err) return next(err);

        await cart.getCartById(req.cartId, (err, cart) => {
            if(err) return next(err);
            res.json(cart);
        });
    });
});

cartRouter.put('/', verifyUserCart, async (req, res, next) => {
    const itemData = req.body;

    await cart.editCartProduct(req.cartId, itemData, async (err) => {
        if(err) return next(err);

        await cart.getCartById(req.cartId, (err, cart) => {
            if(err) return next(err);
            res.json(cart);
        });
    })
});

cartRouter.delete('/', verifyUserCart, async (req, res, next) => {
    const productId = Number(req.query.product_id);

    if(!productId) {
        const error = new Error('Please input a number for the product ID!');
        error.status = 400;
        return next(error);
    }

    await cart.deleteCartProduct(req.cartId, productId, async (err) => {
        if(err) return next(err);

        await cart.getCartById(req.cartId, (err, cart) => {
            if(err) return next(err, cart);
            res.json(cart);
        });
    });
});

cartRouter.post('/checkout', verifyUserCart, async (req, res, next) => {
    await cart.checkoutCart(req.cartId, req.body, async (err, response) => {
        if(err) return next(err);

        res.json(response);
    })
});

module.exports = cartRouter;
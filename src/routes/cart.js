const express = require('express');

const cartRouter = express.Router();

cartRouter.get('/:cartId', (req, res, next) => {
    //Implement Get for user's cart information
});

cartRouter.post('/:cartIdId', (req, res, next) => {
    //Implement Post to add items to user's cart
});

cartRouter.put('/:cartIdId', (req, res, next) => {
    //Implement Put to edit item quantity in user's cart
});

cartRouter.delete('/:cartIdId', (req, res, next) => {
    //Implement Delete to remove items from user's cart
});

cartRouter.post('/:cartIdId/checkout', (req, res, next) => {
    //Implement Post to checkout a user
});

module.exports = cartRouter;
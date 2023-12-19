const express = require('express');

const ordersRouter = express.Router();

ordersRouter.get('/', (req, res, next) => {
    //Implement Get for all orders
});

ordersRouter.get('/:orderId', (req, res, next) => {
    //Implement Get for single order
});


module.exports = ordersRouter;
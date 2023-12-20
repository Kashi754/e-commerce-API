const express = require('express');

const productsRouter = express.Router();

productsRouter.get('/', (req, res, next) => {
    //Implement Get to search for products
});

productsRouter.get('/:productId', (req, res, next) => {
    //Implement Get for single single product
});


module.exports = productsRouter;
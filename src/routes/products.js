const express = require('express');
const products = require('../db/db').products;

const productsRouter = express.Router();

productsRouter.get('/', async (req, res, next) => {
    //Implement Get to search for products

    // Primary search
    const categoryId = req.query.category_id || null;
    const searchTerm = req.query.search || null;

    // Filters
    const filters = {
        priceLessThan: req.query.price_less_than || null,
        priceGreaterThan: req.query.price_greater_than || null
    }
    
    if(!searchTerm && !categoryId) {
        products.getAllProducts(filters, (err, results) => {
            if(err) return next(err);
            res.json(results);
        });
    }

    products.findProductsByFilter(searchTerm, filters, categoryId, (err, results) => {
        if(err) return next(err);
            res.json(results);
    });
});

productsRouter.get('/:productId', (req, res, next) => {
    const productId = Number(req.params.productId);
    if(!productId) {
        const error = new Error('Please input a number for Product ID');
        error.status = 400;
        return next(error);
    }
    const results = products.findProductsById(productId, (err, results) => {
        if(err) return next(err);
            res.json(results);
    });
});


module.exports = productsRouter;
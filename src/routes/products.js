const express = require('express');
const products = require('../db/db').products;

const productsRouter = express.Router();

function verifyIsAdmin(req, res, next) {
    if(req.user.role != 'admin') {
        const error = new Error("You do not have permission to do that!");
        error.status = 403;
        return next(error);
    }
    next();
}

function verifyUserLoggedIn(req, res, next) {
    if(!req.user) {
        const error = new Error("Please log in!");
        error.status = 401;
        return next(error);
    }
    next();
}

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

productsRouter.post('/', [verifyUserLoggedIn, verifyIsAdmin], (req, res, next) => {
    const {quantity = 0, category_ids = [], ...product} = req.body;

    if(!product.name || !product.price) {
        const error = new Error('Please fill in all required fields!');
        error.status = 400;
        return next(error);
    }

    products.addProductToDatabase(product, quantity, category_ids, (err, results) => {
        if(err) return next(err);
        res.json(results);
    })
});

productsRouter.get('/:productId', (req, res, next) => {
    const productId = Number(req.params.productId);
    if(!productId) {
        const error = new Error('Please input a number for Product ID');
        error.status = 400;
        return next(error);
    }

    products.findProductsById(productId, (err, results) => {
        if(err) return next(err);
            res.json(results);
    });
});

productsRouter.patch('/:productId', (req, res, next) => {
    const productId = Number(req.params.productId);
    if(!productId) {
        const error = new Error('Please input a number for Product ID');
        error.status = 400;
        return next(error);
    }

    products.editProductById(productId, req.body, (err, results) => {
        if(err) return next(err);
            res.json(results);
    })
})


module.exports = productsRouter;
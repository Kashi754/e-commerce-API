const express = require('express');
const products = require('../db/db').products;
const verifyUserLoggedIn = require('../middleware/verifyUserLoggedIn');
const verifyUserIsAdmin = require('../middleware/verifyUserIsAdmin.js');

const productsRouter = express.Router();

productsRouter.get('/', async (req, res, next) => {
  //Implement Get to search for products

  // Primary search
  const categoryId = req.query.category_id || null;
  const searchTerm = req.query.search || null;

  // Filters
  const filters = {
    priceLessThan: req.query.price_less_than || null,
    priceGreaterThan: req.query.price_greater_than || null,
  };

  if (!searchTerm && !categoryId) {
    products.getAllProducts(filters, (err, results) => {
      if (err) return next(err);
      return res.status(200).json(results);
    });
  } else {
    products.findProductsByFilter(
      searchTerm,
      filters,
      categoryId,
      (err, results) => {
        if (err) return next(err);
        res.status(200).json(results);
      }
    );
  }
});

productsRouter.get('/categories', async (req, res, next) => {
  products.getAllCategories((err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

productsRouter.post(
  '/',
  [verifyUserLoggedIn, verifyUserIsAdmin],
  (req, res, next) => {
    const { quantity = 0, category_ids = [], ...product } = req.body;

    if (!product.name || !product.price) {
      const error = new Error('Please fill in all required fields!');
      error.status = 400;
      return next(error);
    }

    products.addProductToDatabase(product, quantity, category_ids, (err) => {
      if (err) return next(err);
      res.status(201).json({ message: 'Product Sucessfully Added!' });
    });
  }
);

productsRouter.get('/:productId', (req, res, next) => {
  const productId = Number(req.params.productId);
  if (!productId) {
    const error = new Error('Please input a number for Product ID');
    error.status = 400;
    return next(error);
  }

  products.findProductsById(productId, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

productsRouter.put(
  '/:productId',
  [verifyUserLoggedIn, verifyUserIsAdmin],
  (req, res, next) => {
    const productId = Number(req.params.productId);
    if (!productId) {
      const error = new Error('Please input a number for Product ID');
      error.status = 400;
      return next(error);
    }

    const requiredKeys = ['quantity', 'category_ids', 'price', 'name'];
    const hasAllRequiredKeys = requiredKeys.every((key) => !!req.body[key]);

    if (!hasAllRequiredKeys)
      for (let key in req.body) {
        if (!req.body[key] && key !== 'description') {
          const error = new Error('Please provide all required information!');
          error.status = 400;
          return next(error);
        }
      }

    products.editProductById(productId, req.body, (err, results) => {
      if (err) return next(err);
      res.json(results);
    });
  }
);

module.exports = productsRouter;

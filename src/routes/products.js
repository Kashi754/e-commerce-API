const express = require('express');
const multer = require('multer');
const path = require('path');
const products = require('../db/db').products;
const verifyUserLoggedIn = require('../middleware/verifyUserLoggedIn');
const verifyUserIsAdmin = require('../middleware/verifyUserIsAdmin.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/products');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

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

  let productsResults;
  let error;

  if (!searchTerm && !categoryId) {
    await products.getAllProducts(filters, (err, results) => {
      if (err) error = err;
      productsResults = results;
    });
  } else {
    await products.findProductsByFilter(
      searchTerm,
      filters,
      categoryId,
      (err, results) => {
        if (err) error = err;
        productsResults = results;
      }
    );
  }

  if (error) return next(error);

  const response = productsResults.map(async (product) => {
    let categories;

    await products.getCategoriesForProduct(product.id, (err, results) => {
      if (err) error = err;
      categories = results;
    });

    if (error) return next(error);

    return {
      ...product,
      categories,
    };
  });

  Promise.all(response).then((results) => {
    res.json(results);
  });
});

productsRouter.post(
  '/',
  [verifyUserLoggedIn, verifyUserIsAdmin, upload.single('image')],
  (req, res, next) => {
    const quantity = req.body.quantity || 0;
    const category_ids =
      JSON.parse(req.body.categories).map((id) => Number(id)) || [];
    const product = {
      name: req.body.product_name,
      price: Number(req.body.price),
      description: req.body.description,
      image_file: req.file?.filename || null,
    };

    if (!product.name || !product.price) {
      const error = new Error('Please fill in all required fields!');
      error.status = 400;
      return next(error);
    }

    products.addProductToDatabase(product, quantity, category_ids, (err) => {
      if (err) return next(err);
      res.status(201).json({ message: 'Product Successfully Added!' });
    });
  }
);

productsRouter.get('/categories', async (req, res, next) => {
  products.getAllCategories((err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

productsRouter.post(
  '/categories',
  [verifyUserLoggedIn, verifyUserIsAdmin],
  async (req, res, next) => {
    products.addCategory(req.body.name, (err, results) => {
      if (err) return next(err);
      res.json(results[0]);
    });
  }
);

productsRouter.get('/:productId', (req, res, next) => {
  const productId = req.params.productId;

  products.findProductsById(productId, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

productsRouter.put(
  '/:productId',
  [verifyUserLoggedIn, verifyUserIsAdmin, upload.single('image')],
  (req, res, next) => {
    const quantity = req.body.quantity || 0;
    const category_ids =
      JSON.parse(req.body.categories).map((id) => Number(id)) || [];
    const product = {
      name: req.body.product_name,
      price: Number(req.body.price),
      description: req.body.description,
      image_file: req.file?.filename || req.body.image_file || null,
    };
    const productId = req.params.productId;

    const requiredKeys = ['quantity', 'category_ids', 'price', 'name'];
    const hasAllRequiredKeys = requiredKeys.every((key) => !!req.body[key]);

    if (!hasAllRequiredKeys)
      for (let key in req.body) {
        if (!req.body[key] && key !== 'description') {
          const error = new Error('Please fill in all required fields!');
          error.status = 400;
          return next(error);
        }
      }

    products.editProductById(
      productId,
      product,
      quantity,
      category_ids,
      (err) => {
        if (err) return next(err);
        res.status(201).json({ message: 'Product Successfully Updated!' });
      }
    );
  }
);

module.exports = productsRouter;

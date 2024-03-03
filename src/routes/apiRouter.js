const express = require('express');
const openApi = require('../../public/res/openapi.json');
const verifyUserLoggedIn = require('../middleware/verifyUserLoggedIn');
const registerRouter = require('./register');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const usersRouter = require('./users');
const productsRouter = require('./products');
const cartRouter = require('./cart');
const ordersRouter = require('./orders');
const secretRouter = require('./secret');
const webhookRouter = require('./webhook');

const apiRouter = express.Router();

apiRouter.use('/register', registerRouter);
apiRouter.use('/login', loginRouter);
apiRouter.use('/logout', verifyUserLoggedIn, logoutRouter);
apiRouter.use('/users', verifyUserLoggedIn, usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/cart', verifyUserLoggedIn, cartRouter);
apiRouter.use('/orders', verifyUserLoggedIn, ordersRouter);
apiRouter.use('/secret', verifyUserLoggedIn, secretRouter);
apiRouter.use('/webhook', webhookRouter);
apiRouter.get('/health', (_req, res) => {
  res.sendStatus(200);
});
apiRouter.get('/openapi.json', (_req, res) => {
  res.json(openApi);
});
apiRouter.use('/*', (_req, res) => {
  res.sendStatus(404);
});

module.exports = apiRouter;

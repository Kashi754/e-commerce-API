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

const apiRouter = express.Router();

apiRouter.use('/register', registerRouter);
apiRouter.use('/login', loginRouter);
apiRouter.use('/logout', verifyUserLoggedIn, logoutRouter);
apiRouter.use('/users', verifyUserLoggedIn, usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/cart', verifyUserLoggedIn, cartRouter);
apiRouter.use('/orders', verifyUserLoggedIn, ordersRouter);
apiRouter.get('/openapi.json', (req, res, next) => {
    res.json(openApi);
});

module.exports = apiRouter;
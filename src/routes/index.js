const express = require('express');
const openApi = require('../../public/res/openapi.json');
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
apiRouter.use('/logout', logoutRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.get('/openapi.json', (req, res, next) => {
    res.json(openApi);
});

module.exports = apiRouter;
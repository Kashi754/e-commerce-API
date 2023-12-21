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

const verifyUserLoggedIn = (req, res, next) => {
    if(!req.session.passport?.user) {
        const error = new Error("Please log in!");
        error.status = 401;
        return next(error);
    }
    next();
}

apiRouter.use('/register', registerRouter);
apiRouter.use('/login', loginRouter);
apiRouter.use('/logout', verifyUserLoggedIn, logoutRouter);
apiRouter.use('/users', verifyUserLoggedIn, usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/cart', verifyUserLoggedIn, cartRouter);
apiRouter.get('/openapi.json', (req, res, next) => {
    res.json(openApi);
});

module.exports = apiRouter;
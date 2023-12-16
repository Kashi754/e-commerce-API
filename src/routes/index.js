const express = require('express');

const apiRouter = express.Router();

apiRouter.get('/', (req, res, next) => {
    res.send('Hello World!');
});

apiRouter.post('/', (req, res, next) => {
    const error = new Error('You fucked up!');
    return next(error);
});

module.exports = apiRouter;
const express = require('express');

const logoutRouter = express.Router();

logoutRouter.get('/', (req, res, next) => {
    req.logout((err) => {if(err) return next(err)});
    console.log('Successfully logged out!');
    res.status(204).send(`Successfully logged out!`);
});


module.exports = logoutRouter;
const express = require('express');

const registerRouter = express.Router();

registerRouter.post('/', (req, res, next) => {
    //Implement Post to add a new user
});

module.exports = registerRouter;
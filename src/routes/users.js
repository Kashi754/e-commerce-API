const express = require('express');

const usersRouter = express.Router();

usersRouter.get('/:userId', (req, res, next) => {
    //Implement Get for a user's information
});

usersRouter.put('/:userId', (req, res, next) => {
    //Implement Put to edit a user's information
});


module.exports = usersRouter;
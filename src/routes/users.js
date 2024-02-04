const express = require('express');
const users = require('../db/db').users;

const usersRouter = express.Router();

usersRouter.get('/', async (req, res, next) => {
    //Implement Get for a user's information
    const userId = req.query?.userId || req.user.id;
    if(!userId) {
        console.log(req);
        const error = new Error('No userId specified!');
        error.status = 400;
        return next(error);
    }

    if(req.query?.userId && req.user.role != 'admin') {
        const error = new Error("You do not have permission to view User with that ID!");
        error.status = 403;
        return next(error);
    }
    console.log(userId);
    await users.findUserById(userId, (err, user) => {
        if(err) return next(err);
        res.json(user);
    });
});

usersRouter.put('/:userId', async (req, res, next) => {
    //Implement Put to edit a user's information
    const userId = req.params.userId;
    const user = req.body;

    if(req.user.id != userId) {
        const error = new Error("You do not have permission to edit User with that ID!");
        error.status = 403;
        return next(error);
    }
    await users.editUserById(userId, user, (err, updatedUser) => {
        if(err) return next(err);
        res.status(201).json(updatedUser);
    });
});


module.exports = usersRouter;
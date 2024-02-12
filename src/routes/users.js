const express = require('express');
const users = require('../db/db').users;

const usersRouter = express.Router();

usersRouter.get('/', async (req, res, next) => {
    //Implement Get for a user's information
    const userId = req.query?.userId;
    if(!userId) {
        const error = new Error('No userId specified!');
        error.status = 400;
        return next(error);
    }

    if(req.user.role !== 'admin') {
        const error = new Error("Permission Denied!");
        error.status = 403;
        return next(error);
    }
    
    await users.findUserById(userId, (err, user) => {
        if(err) return next(err);
        res.json(user);
    });
});

usersRouter.put('/', async (req, res, next) => {
    //Implement Put to edit a user's information
    if(req.user) {    
        let userId = req.user.id;    
        const user = req.body;

        if(req.user.role === 'admin' && req.query?.userId) {
            userId = req.query.userId;
        }

        if(req.user.role !== 'admin') {
            user.role = 'user';
        }
    
        await users.editUserById(userId, user, (err, updatedUser) => {
            if(err) return next(err);
            res.status(201).json(updatedUser);
        });
    } else {
        const error = new Error('Please Log In!');
        error.status = 401;
        throw error;
    }
});

usersRouter.get('/list', async (req, res, next) => {
    if(req.user.role !== 'admin') {
        const error = new Error('Permission Denied!');
        error.status = 403;
        return next(error);
    }

    
})


module.exports = usersRouter;
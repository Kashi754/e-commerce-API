const express = require('express');
const users = require('../db/db').users;
const bcrypt = require('bcrypt');

const registerRouter = express.Router();

registerRouter.post('/', async (req, res, next) => {
    //Implement Post to add a new user
    const user = req.body;
    try {
        if(!user.username || !user.email || !user.first_name || !user.last_name || !user.password) {
            const error = new Error('Please fill in all required fields!');
            error.status = 400;
            return next(error);
        }

        const existingUser = await users.findUser(user.username, (err, user) => {
            if(err) return next(err);
            return user;
        });

        if(existingUser) {
            const error = new Error('User with that username or email already exists!');
            error.status = 422;
            return next(error);
        } 
        
        const SALT_ROUNDS = 10;
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(user.password, salt);
        user.password_hash = hash;
        delete user.password;


        await users.createUser(user, (err, user) => {
            if(err) return next(err);
            res.status(201).send("Success! New User Created");   
        });
        
            
    } catch(err) {
        err.status = 500;
        return next(err);
    }

});

module.exports = registerRouter;
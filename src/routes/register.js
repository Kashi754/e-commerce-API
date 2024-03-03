const express = require('express');
const users = require('../db/db').users;
const bcrypt = require('bcrypt');

const registerRouter = express.Router();

registerRouter.post('/', async (req, res, next) => {
  //Implement Post to add a new user
  const user = req.body;
  try {
    if (!user.username || !user.email || !user.password || !user.first_name) {
      const error = new Error('Please fill in all required fields!');
      error.status = 400;
      return next(error);
    }

    await users.findUser(user.username, (err) => {
      if (err) return next(err);
      return;
    });

    const SALT_ROUNDS = 10;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(user.password, salt);
    user.password_hash = hash;
    delete user.password;
    user.role = !req.user
      ? 'user'
      : !req.user.role === 'admin'
        ? 'user'
        : !user.role
          ? 'user'
          : user.role;

    await users.createUser(user, (err) => {
      if (err) return next(err);
      res.status(201).send(user);
    });
  } catch (err) {
    err.status = 500;
    return next(err);
  }
});

module.exports = registerRouter;

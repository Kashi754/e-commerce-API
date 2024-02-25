const express = require('express');
const users = require('../db/db').users;
const bcrypt = require('bcrypt');

const usersRouter = express.Router();

usersRouter.put('/', async (req, res, next) => {
  //Implement Put to edit a user's information
  if (req.user) {
    let userId = req.user.id;
    const user = req.body;

    if (req.user.role === 'admin' && req.query?.userId) {
      userId = req.query.userId;
    }

    if (req.user.role !== 'admin') {
      user.role = 'user';
    }

    await users.editUserById(userId, user, (err, updatedUser) => {
      if (err) return next(err);
      res.status(201).json(updatedUser);
    });
  } else {
    const error = new Error('Please Log In!');
    error.status = 401;
    return next(error);
  }
});

usersRouter.put('/password', async (req, res, next) => {
  //Implement Put to edit a user's password
  const { oldPassword, newPassword } = req.body;
  if (req.user) {
    await users.findUserAuth(req.user.username, async (err, user) => {
      if (!user || err) {
        const error = new Error('Please Log In!');
        error.status = 401;
        return next(error);
      }

      const matchedPassword = await bcrypt.compare(
        oldPassword,
        user.password_hash
      );

      if (!matchedPassword) {
        const error = new Error('Incorrect old password!');
        error.status = 401;
        return next(error);
      }

      const SALT_ROUNDS = 10;
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hash = await bcrypt.hash(newPassword, salt);

      await users.editPassword(req.user.id, hash, (err) => {
        if (err) return next(err);
        res.status(201).json({
          status: 'success',
          message: 'Password changed successfully!',
        });
      });
    });
  }
});

usersRouter.get('/admin', async (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }
  const { filter } = req.query || null;

  if (filter === 'user' || filter === 'admin') {
    await users.getUsersByRole(filter, (err, users) => {
      if (err) {
        return next(err);
      }
      res.json(users);
    });
  } else if (filter) {
    await users.getUserByEmail(filter, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json([user]);
    });
  } else {
    await users.getUsers((err, users) => {
      if (err) {
        return next(err);
      }
      res.json(users);
    });
  }
});

usersRouter.get('/admin/:userId', async (req, res, next) => {
  //Implement Get for a user's information
  const userId = req.query?.userId;
  if (!userId) {
    const error = new Error('No userId specified!');
    error.status = 400;
    return next(error);
  }

  if (req.user.role !== 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }

  await users.findUserById(userId, (err, user) => {
    if (err) return next(err);
    res.json(user);
  });
});

usersRouter.patch('/:userId', async (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }
  const userId = req.params.userId;
  const user = req.body;

  if (!userId || !user) {
    const error = new Error('Invalid Input!');
    error.status = 400;
    return next(error);
  }
  await users.patchUserById(userId, user, (err) => {
    if (err) return next(err);
  });

  const { filter } = req.query || null;

  if (filter) {
    await users.getUserByEmail(filter, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json([user]);
    });
  } else {
    await users.getUsers((err, users) => {
      if (err) {
        return next(err);
      }
      res.json(users);
    });
  }
});

usersRouter.delete('/:userId', async (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }

  const userId = req.params.userId;

  if (!userId) {
    const error = new Error('Please input a number for user ID');
    error.status = 400;
    return next(error);
  }

  await users.deleteUserById(userId, (err) => {
    if (err) return next(err);
  });

  const { filter } = req.query || null;

  if (filter) {
    await users.getUserByEmail(filter, (err, user) => {
      if (err) {
        return next(err);
      }
      return res.json([user]);
    });
  } else {
    await users.getUsers((err, users) => {
      if (err) {
        return next(err);
      }
      return res.json(users);
    });
  }
});

module.exports = usersRouter;

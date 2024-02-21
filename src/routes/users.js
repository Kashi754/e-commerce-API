const express = require('express');
const users = require('../db/db').users;

const usersRouter = express.Router();

usersRouter.get('/', async (req, res, next) => {
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

usersRouter.get('/admin', async (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }
  const { filter } = req.query || null;
  console.log(req.query);

  if (filter === 'user' || filter === 'admin') {
    await users.getUsersByRole(filter, (err, users) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.json(users);
    });
  } else if (filter) {
    await users.getUserByEmail(filter, (err, user) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.json([user]);
    });
  } else {
    await users.getUsers((err, users) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.json(users);
    });
  }
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
        console.log(err);
        return next(err);
      }
      res.json([user]);
    });
  } else {
    await users.getUsers((err, users) => {
      if (err) {
        console.log(err);
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
  console.log(req.params);

  if (!userId) {
    const error = new Error('Please input a number for user ID');
    error.status = 400;
    return next(error);
  }

  console.log(userId);

  await users.deleteUserById(userId, (err) => {
    if (err) return next(err);
  });

  const { filter } = req.query || null;

  if (filter) {
    await users.getUserByEmail(filter, (err, user) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      return res.json([user]);
    });
  } else {
    await users.getUsers((err, users) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(users);
      return res.json(users);
    });
  }
});

module.exports = usersRouter;

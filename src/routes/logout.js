const express = require('express');

const logoutRouter = express.Router();

logoutRouter.get('/', (req, res, next) => {
  if (req.user) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((error) => {
        if (error) {
          return next(error);
        }
        res.status(204).json({ message: `Successfully logged out!` });
      });
    });
  } else {
    const error = new Error('Please Log In!');
    error.status = 401;
    return next(error);
  }
});

module.exports = logoutRouter;

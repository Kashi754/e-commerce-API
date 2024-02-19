const express = require('express');

const logoutRouter = express.Router();

logoutRouter.get('/', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }
      res.status(204).send(`Successfully logged out!`);
    });
  });
});

module.exports = logoutRouter;

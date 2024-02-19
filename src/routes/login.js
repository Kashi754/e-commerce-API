const express = require('express');
const passport = require('passport');

const loginRouter = express.Router();

loginRouter.get('/success', (req, res, next) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    const error = new Error('Please Log In!');
    error.status = 401;
    return next(error);
  }
});

loginRouter.get('/failed', (req, _res, next) => {
  const message = req.session.error || 'failure';
  const error = new Error(message);
  error.status = 401;
  return next(error);
});

loginRouter.post(
  '/',
  passport.authenticate('local', { session: true, failWithError: true }),
  (req, res) => {
    // const user = req.user;
    // return res.json(user);
    res.redirect('/login/success');
  },
  (err, req, res) => {
    if (err) {
      req.session.error = 'Incorrect Username or Password';
      res.redirect('/login/failed');
    }
  }
);

loginRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
loginRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

module.exports = loginRouter;

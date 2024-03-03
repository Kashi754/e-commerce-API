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
  const message = req.session.error.message || 'failure';
  const status = req.session.error.status || 401;
  const error = new Error(message);
  error.status = 401;
  return next({ status, message });
});

loginRouter.post(
  '/',
  passport.authenticate('local', { session: true, failWithError: true }),
  (req, res) => {
    res.redirect('/login/success');
  },
  (err, req, res, next) => {
    if (req.authError) {
      console.log('Login Failed!');
      const error = req.authError;
      error.status = 401;
      return next(error);
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

const express = require('express');
const passport = require('passport');
const {
  limitLoginRequests,
  limiterConsecutiveFailsByUsername,
} = require('../middleware/loginLimiter');

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
  [
    limitLoginRequests,
    passport.authenticate('local', { session: true, failWithError: true }),
  ],
  (req, res) => {
    res.redirect('/login/success');
  },
  async (err, req, res, next) => {
    if (req.authError) {
      try {
        await limiterConsecutiveFailsByUsername.consume(req.userLogin);
        const error = { message: req.authError };
        error.status = 401;
        return next(error);
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          console.log(req.userLogin);
          rlRejected.status = 500;
          return next(rlRejected);
        } else {
          res.set(
            'Retry-After',
            String(Math.round(rlRejected.msBeforeNext / 1000)) || 1
          );
          res.status(429).send({
            status: 429,
            message: 'Too Many Requests',
          });
        }
      }
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

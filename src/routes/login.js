const express = require('express');
const passport = require('passport');

const loginRouter = express.Router();

loginRouter.post('/', passport.authenticate('local'),
(req, res, next) => {
    const user = req.session.passport;
    res.json(user);
});


module.exports = loginRouter;
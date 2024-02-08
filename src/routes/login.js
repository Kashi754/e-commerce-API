const express = require('express');
const passport = require('passport');

const loginRouter = express.Router();

loginRouter.get("/success", (req, res) => {
    if(req.user) {
        res.status(200).json(req.user);
    }
})

loginRouter.get("/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: 'failure'
    })
})

loginRouter.post('/', passport.authenticate('local', { failWithError: true }),
(req, res, next) => {
    const user = req.user;
    return res.json(user);
}, (err, req, res, next) => {
    if(err) {
        throw new Error('Incorrect username or password.')
    }
});

loginRouter.get('/google', passport.authenticate('google', { scope: ["profile"]}));
loginRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/failed'
}))


module.exports = loginRouter;
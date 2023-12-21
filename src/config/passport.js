const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const users = require('../db/db').users;

passport.use(new LocalStrategy(
    async function (username, password, done) {
        await users.findUserAuth(username, async (err, user) => {
            if(err) return done(err);
            if(!user) return done(null, false);
            const matchedPassword = await bcrypt.compare(password, user.password_hash);
            if(!matchedPassword) return done(null, false);

            console.log(`Successfully logged in as ${user.username}`)
            return done(null, user);
        })
    }
));

passport.serializeUser((user, done) => {
    done(null, {
        id: user.id, 
        role: user.role
    });
});

passport.deserializeUser(async (user, done) => {
    return done(null, user);
});
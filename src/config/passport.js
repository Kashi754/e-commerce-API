const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require('../db/db');

passport.use(new LocalStrategy(
    async function (username, password, done) {
        await db.users.findUserAuth(username, (err, user) => {
            if(err) return done(err);
            if(!user) return done(null, false);
            console.log(password);
            console.log(user);
            const matchedPassword = bcrypt.compare(password, user.password_hash);
            if(!matchedPassword) return done(null, false);

            console.log(`Successfully logged in as ${user.username}`)
            return done(null, user);
        })
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    await db.users.findUserById(id,
        function (err, user) {
            if(err) return done(err);
            return done(null, user);
        }
    )
});
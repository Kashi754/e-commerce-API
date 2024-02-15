require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const users = require('../db/db').users;

passport.use(new LocalStrategy(
    async function (username, password, done) {
        await users.findUserAuth(username, async (err, user) => {
            if(!user || err) {
                const error = new Error('Incorrect username or password.')
                console.log(error);
                return done(error);
            };
            const matchedPassword = await bcrypt.compare(password, user.password_hash);
            if(!matchedPassword) {
                console.log('Incorrect password');
                return done(null, false);
            };
            delete user.password_hash;

            console.log(`User successfully logged in as ${user.username}!`)
            return done(null, user);
        })
    }
));

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/login/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        await users.findOrCreate(profile, async (err, user) => {
            if(err) {
                return done(err);
            }
            console.log(`User successfully logged in as ${profile.displayName}!`);
            return done(null, user);
        })
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    return done(null, user);
});
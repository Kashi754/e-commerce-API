const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

import 'dotenv/config';

const knex = require('knex')(configOptions);

module.exports = {
    knex: knex,
    users: {
        findUserById: async (id, done) => {
            //search database for user by id
            try {
                const user = await knex.select('id', 'username', 'email', 'first_name', 'last_name')
                    .from('user')
                    .where('id', id)
                done(null, user[0])
            } catch(err) {
                done(err);
            }
        },

        findUser: async (userString, done) => {
            //search database for user by username or email
            try {
                const user = await knex.select('id', 'username', 'email', 'first_name', 'last_name')
                    .from('user')
                    .where('username', userString)
                    .orWhere('email', userString);
                done(null, user[0])
            } catch(err) {
                done(err);
            }
        },

        findUserAuth: async(userName, done) => {
            try {
                const user = await knex.select('id', 'username', 'email', 'first_name', 'last_name', 'password_hash')
                    .from('user')
                    .where('username', userName);
                if(user) {
                    return done(null, user[0]);
                }
                const error = new Error('An unexpected error has occured');
                return done(error);
            } catch(err) {
                return done(err);
            }
        },

        createUser: async (user) => {
            const newUser = await knex('user').insert(user);//Add new user to the database   
            return newUser;
        },
    }
}
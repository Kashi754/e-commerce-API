const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

require('dotenv').config();

const knex = require('knex')(configOptions);

module.exports = {
    findUserById: async (id, done) => {
        //search database for user by id
        try {
            const user = await knex.first('id', 'username', 'email', 'first_name', 'last_name', 'role')
                .from('user')
                .where('id', id)
            if(!user) {
                const error = new Error(`User with id ${id} not found`);
                error.status = 404;
                return done(error);
            }
            done(null, user)
        } catch(err) {
            done(err);
        }
    },

    findUser: async (userString, done) => {
        //search database for user by username or email
        try {
            const user = await knex.first()
                .from('user')
                .where('username', userString)
                .orWhere('email', userString);
            if(user) {
                const error = new Error('User with that username or email already exists!');
                error.status = 422;
                return next(error);
            }
            done(null)
        } catch(err) {
            done(err);
        }
    },

    findUserAuth: async(userLogin, done) => {
        try {
            const user = await knex('user')
                .join('cart', 'user.id', '=', 'cart.user_id')
                .where('username', userLogin)
                .orWhere('email', userLogin)
                .first('user.id as id', 'username', 'email', 'first_name', 'last_name', 'role', 'password_hash', 'cart.id as cartId');
            if(!user) {
                const error = new Error(`User with username ${userLogin} not found!`);
                error.status = 404;
                return done(error);
            }
            return done(null, user);
        } catch(err) {
            return done(err);
        }
    },

    createUser: async (user, done) => {
        try {
            const response = await knex('user').returning('id', 'username', 'email').insert(user);
            const newUser = response[0];

            if(!newUser) {
                const error = new Error('User not created!');
                return done(error)
            }
            console.log(`User created with username: ${user.username} and email: ${user.email}!`);
            return done(null, newUser);
        } catch(err) {
            return done(err)
        }
    },

    editUserById: async (id, user, done) => {
        try {
            const response = await knex('user').where('id', id).update(
                user, [
                    'username', 
                    'email', 
                    'first_name', 
                    'last_name',
                ]
            );

            const updatedUser = response[0];

            if(!updatedUser) {
                const error = new Error(`User with ID ${id} not found!`);
                error.status = 404;
                return done(error);
            }
            done(null, updatedUser);
        } catch(err) {
            done(err);
        }
    }
}
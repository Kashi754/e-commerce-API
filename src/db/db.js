const knexfile = require('../../knexfile');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];


const knex = require('knex')(configOptions);

module.exports = {
    knex: knex,
    users: require('./users'),
    products: require('./products'),
    cart: require('./cart'),
    orders: require('./orders')
}
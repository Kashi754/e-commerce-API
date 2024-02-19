const knexFile = require('../../knexFile');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const configOptions = knexFile[env];

const knex = require('knex')(configOptions);

module.exports = {
  knex: knex,
  users: require('./users'),
  products: require('./products'),
  cart: require('./cart'),
  orders: require('./orders'),
};

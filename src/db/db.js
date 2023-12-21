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
                const user = await knex.first('id', 'username', 'email', 'first_name', 'last_name')
                    .from('user')
                    .where('id', id)
                if(!user) {
                    const error = new Error(`User with id ${id}not found`);
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
                const user = await knex.first('id', 'username', 'email', 'first_name', 'last_name')
                    .from('user')
                    .where('username', userString)
                    .orWhere('email', userString);
                if(user) {
                    const error = new Error('User with that username or email already exists!');
                    error.status = 422;
                    return next(error);
                }
                done(null, user)
            } catch(err) {
                done(err);
            }
        },

        findUserAuth: async(userName, done) => {
            try {
                const user = await knex.first('id', 'username', 'email', 'first_name', 'last_name', 'password_hash')
                    .from('user')
                    .where('username', userName);
                if(!user) {
                    const error = new Error(`User with username ${userName} not found!`);
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
                console.log(`User ${user.id} created with username: ${user.username} and email: ${user.email}!`);
                return done(null, newUser);
            } catch(err) {
                return done(err)
            }
        },

        editUserById: async (id, user, done) => {
            try {
                const response = await knex('user').where('id', id).update(
                    user, [
                        'id', 
                        'username', 
                        'email', 
                        'first_name', 
                        'last_name'
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
    },
    
    products: {
        getAllProducts: async (filters, done) => {
            let { priceLessThan, priceGreaterThan } = filters;
            priceLessThan = Number(priceLessThan) || 1000000000000;
            priceGreaterThan = Number(priceGreaterThan) || 0;

            const results = await knex('product')
                .join('product_inventory', 'product.inventory_id', '=', 'product_inventory.id')
                .where('product.price', '>=', priceGreaterThan)
                .where('product.price', '<=', priceLessThan)
                .select({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    description: 'product.description',
                    qty_in_stock: 'product_inventory.quantity'
                });

                if(results.length < 1) {
                    const error = new Error('No products found!');
                    error.status = 404;
                    return done(error);
                }
    
                done(null, results);
        },

        findProductsByFilter: async (searchTerm, filters, categoryId, done) => {
            let { priceLessThan, priceGreaterThan } = filters;
            priceLessThan = Number(priceLessThan) || 1000000000000;
            priceGreaterThan = Number(priceGreaterThan) || 0;
            const searchFilter = '%' + searchTerm + '%';

            let queryBuilder = knex('product')
            .join('product_inventory', 'product.inventory_id', '=', 'product_inventory.id')
            .join('product_category', 'product.id', '=', 'product_category.product_id')
            .join('category', 'product_category.category_id', '=', 'category.id')
            

            queryBuilder = !categoryId ? queryBuilder : queryBuilder
                .where('category.id', '=', categoryId);

            queryBuilder = !searchTerm ? queryBuilder : queryBuilder
                .whereILike('product.name', searchFilter)
                .orWhereILike('product.description', searchFilter)
                .orWhereILike('category.name', searchFilter)

            const results = await queryBuilder
                .andWhere('product.price', '>=', priceGreaterThan)
                .andWhere('product.price', '<=', priceLessThan)
                .select({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    description: 'product.description',
                    qty_in_stock: 'product_inventory.quantity'
                })
                .distinct('product.id');

            if(results.length < 1) {
                const error = new Error('No products found!');
                error.status = 404;
                return done(error);
            }

            done(null, results);
        },

        findProductsById: async (id, done) => {
            const results = await knex('product')
                .join('product_inventory', 'product.inventory_id', '=', 'product_inventory.id')
                .where('product.id', '=', id)
                .first({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    description: 'product.description',
                    qty_in_stock: 'product_inventory.quantity'
                })

                if(!results) {
                    const error = new Error(`Product with ID ${id} not found!`);
                    error.status = 404;
                    return done(error);
                }
    
                done(null, results);
        }
    },

    cart: {
        getUserForCart: async (id, done) => {
            const user = await knex('user')
                .join('cart', 'user.id', '=', 'cart.user_id')
                .where('cart.id', '=', id)
                .first({ userId: 'user.id' });

            if(!user) {
                const error = new Error(`User with cart ID ${id} not found!`);
                error.status = 404;
                return done(error);
            }

            done(null, user.userId);
        },

        getCartById: async (cartId, done) => {
            const products = await knex('product')
                .join('cart_product', 'product.id', '=', 'cart_product.product_id')
                .join('cart', 'cart_product.cart_id', '=', 'cart.id')
                .where('cart.id', '=', cartId)
                .select({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    qty: 'cart_product.quantity'
                })

            const total = await knex('cart')
                .where('id', '=', cartId)
                .first('total_price')

            if(products.length < 1 && !total) {
                const error = new Error(`Cart with ID ${cartId} not found`);
                error.status = 404;
                done(error);
            }

            const response = { products, total };
            done(null, response);
        }
    }
}
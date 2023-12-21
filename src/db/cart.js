const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

import 'dotenv/config';

const knex = require('knex')(configOptions);

module.exports = {
    getUserForCart: async (id, done) => {
        try {
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
        } catch (err) {
            done(err);
        }
    },

    getCartById: async (cartId, done) => {
        try {
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
                return done(error);
            }

            const response = { products, total };
            done(null, response);
        } catch (err) {
            done(err);
        }
    },

    addItemToCart: async (userId, itemData, done) => {
        try {
            const { productId, qty } = itemData;

            const cart = await knex('cart')
                .where('user_id', '=', userId)
                .first();

            const cartItem = await knex('cart_product')
                .returning('product_id')
                .insert({
                    cart_id: cart.id,
                    product_id: productId,
                    quantity: qty
                });

            if(cartItem.length < 1) {
                const error = new Error(`Something went wrong!`);
                error.status = 500;
                return done(error);
            }
            
            done(null, cart.id);
        } catch (err) {
            done(err);
        }
    },

    editCartProduct: async (userId, itemData, done) => {
        try {
            const { productId, qty } = itemData;

            const cart = await knex('cart')
                .where('user_id', '=', userId)
                .first();

            const cartItem = await knex('cart_product')
                .where('product_id', productId)
                .where('cart_id', cart.id)
                .update(
                    { quantity: qty }, 
                    ['cart_id', 'product_id']
                );

            if(cartItem.length < 1) {
                const error = new Error(`Can't edit product. Does not exist in cart!`);
                error.status = 500;
                return done(error);
            }
            
            done(null, cart.id);
        } catch(err) {
            done(err);
        }
    },

    deleteCartProduct: async (userId, productId, done) => {
        try {
            const cart = await knex('cart')
            .where('user_id', '=', userId)
            .first();

            const rowsAffected = await knex('cart_product')
                .where('product_id', productId)
                .where('cart_id', cart.id)
                .del();

            if(rowsAffected < 1) {
                const error = new Error(`Something went wrong!`);
                error.status = 500;
                return done(error);
            }

            done(null, cart.id);
        } catch(err) {
            done(err);
        }
    }
}
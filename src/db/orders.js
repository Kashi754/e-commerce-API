const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

import 'dotenv/config';

const knex = require('knex')(configOptions);

function processPayment (paymentInformation, billingAddr, totalPrice) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({paymentSuccessful: true, provider: 'Visa'});
        }, 2000)
    });
}

module.exports = {
    getUserForOrder: async (id, done) => {
        try {
            const user = await knex('user')
                .join('order', 'user.id', '=', 'order.user_id')
                .where('order.id', '=', id)
                .first({ userId: 'user.id' });

            if(!user) {
                const error = new Error(`User with order ID ${id} not found!`);
                error.status = 404;
                return done(error);
            }

            done(null, user.userId);
        } catch (err) {
            done(err);
        }
    },

    getOrderById: async (orderId, userId, done) => {
        try {
            const orderDetails = await knex('order')
                .join('order_details', 'order.details_id', '=', 'order_details.id')
                .where('order.user_id', '=', userId)
                .first({
                    id: 'order.id',
                    date: 'order_details.created_at',
                    total: 'order_details.total_price',
                    status: 'order_details.status'
                })

            if(!orderDetails) {
                const error = new Error(`Order with ID ${orderId} not found`);
                error.status = 404;
                return done(error);
            }
            
            const products = await knex('product')
                .join('order_items', 'product.id', '=', 'order_items.product_id')
                .join('order', 'order_items.order_id', '=', 'order.id')
                .where('order.id', '=', orderId)
                .select({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    qty: 'order_items.quantity'
                })

            const shipping_address = await knex('address')
                .join('order_details', 'address.id', '=', 'order_details.shipping_address_id')
                .join('order', 'order_details.id', '=', 'order.details_id')
                .first(
                    'addr_line_1',
                    'addr_line_2',
                    'city',
                    'state',
                    'zip_code'
                )


            const response = { 
                ...orderDetails, 
                products: products, 
                shipping_address: shipping_address 
            };

            done(null, response);
        } catch (err) {
            done(err);
        }
    },

    getOrdersForUser: async (userId, done) => {
        try {
            const orders = await knex('order')
                .join('order_details', 'order.details_id', '=', 'order_details.id')
                .where('order.user_id', '=', userId)
                .select({
                    id: 'order.id',
                    date: 'order_details.created_at',
                    total: 'order_details.total_price',
                    status: 'order_details.status'
                })

            if(orders.length < 1 ) {
                const error = new Error(`No orders found for user with id ${userId}!`);
                error.status = 404;
                return done(error);
            }

            done(null, orders);
        } catch (err) {
            done(err);
        }
    },
}
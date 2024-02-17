const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

require('dotenv').config();

const knex = require('knex')(configOptions);

const getCartById = async (cartId, done) => {
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

        const response = { products, total: total.total_price };
        done(null, response);
    } catch (err) {
        done(err);
    }
}

exports.getCartById = getCartById;

exports.getCartByPaymentIntent = async (paymentIntentId) => {
    try {
        const cartId = await knex('cart')
            .where('payment_intent', paymentIntentId)
            .first('id');

        if(!cartId) {
            const error = new Error(`Cart with payment_intent: ${paymentIntentId} not found!`);
            return [null, error];
        }

        return [cartId.id];
    } catch (err) {
        console.error(err);
        return [null, err];
    }
}

exports.getUserForCart = async (id, done) => {
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
}


exports.addItemToCart = async (cartId, itemData, done) => {
    try {
        const { productId, qty } = itemData;

        const cartItem = await knex('cart_product')
            .returning('product_id')
            .insert({
                cart_id: cartId,
                product_id: productId,
                quantity: qty
            });

        if(cartItem.length < 1) {
            const error = new Error(`Something went wrong!`);
            error.status = 500;
            return done(error);
        }
        
        getCartById(cartId, done);
    } catch (err) {
        done(err);
    }
}

exports.editCartProduct = async (cartId, itemData, done) => {
    try {
        const { productId, qty } = itemData;

        const cartItem = await knex('cart_product')
            .where('product_id', productId)
            .where('cart_id', cartId)
            .update(
                { quantity: qty }, 
                ['cart_id', 'product_id']
            );

        if(cartItem.length < 1) {
            const error = new Error(`Can't edit product. Does not exist in cart!`);
            error.status = 500;
            return done(error);
        }
        
        getCartById(cartId, done);
    } catch(err) {
        done(err);
    }
}

exports.deleteCartProduct = async (cartId, productId, done) => {
    try {
        const rowsAffected = await knex('cart_product')
            .where('product_id', productId)
            .where('cart_id', cartId)
            .del();

        if(rowsAffected < 1) {
            const error = new Error(`Something went wrong!`);
            error.status = 500;
            return done(error);
        }

        getCartById(cartId, done);
    } catch(err) {
        done(err);
    }
}

exports.createPaymentIntent = async (cartId, paymentIntent, done) => {
    try {
        const intentCreated = await knex('cart')
            .where('id', cartId)
            .update({
                'payment_intent': paymentIntent
            }, ['id']);
        
        if(intentCreated.length < 1) {
            const error = new Error(`Something went wrong!`);
            error.status = 500;
            return done(error);
        }
        return done(null, {msg: `payment intent ${paymentIntent} created!`});
    } catch(err) {
        done(err);
    }
}

exports.updateShippingPrice = async (cartId, shippingPrice, done) => {
    try {
        const serviceTypeUpdated = await knex('cart')
            .where('id', cartId)
            .update({
                'shipping_price': shippingPrice
            }, ['id']);

        if(serviceTypeUpdated.length < 1) {
            const error = new Error(`Something went wrong!`);
            error.status = 500;
            return done(error);
        }
        return done(null, {msg: `shipping price ${shippingPrice} updated!`});
    } catch(err) {
        done(err);
    }
}
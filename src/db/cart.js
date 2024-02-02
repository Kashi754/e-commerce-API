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

        const response = { products, total };
        done(null, response);
    } catch (err) {
        done(err);
    }
}

function processPayment (paymentInformation, billingAddr, totalPrice) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({paymentSuccessful: true, provider: 'Visa'});
        }, 2000)
    });
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

exports.getCartById = getCartById;

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

exports.checkoutCart = async (cartId, paymentInfo, done) => {
    const {
        payment_information,
        billing_address,
        shipping_address,
        shipping_method
    } = paymentInfo;

    if(!payment_information || !billing_address || !shipping_method) {
        const error = new Error('Please fill out all required fields!');
        error.status = 400;
        return done(error);
    }

    if(!billing_address.is_shipping && !shipping_address) {
        const error = new Error('Please fill out all required fields!');
        error.status = 400;
        return done(error);
    }

    try {
        // Check if the cart has items in it
        const cartItems = await knex('cart_product')
        .where('cart_id', '=', cartId)
        .select('product_id', 'quantity')

        if(cartItems.length < 1) {
            const error = new Error('Cannot checkout empty cart!');
            error.status = 400;
            return done(error);
        }   

        // Get the userId and TotalPrice from the cart
        const { user_id, total_price } = await knex('cart')
            .where('id', '=', cartId)
            .first('user_id', 'total_price');

        // Process the payment and if declined return an error
        const paymentResults = await processPayment(payment_information, billing_address, total_price);
        const { paymentSuccessful, provider } = paymentResults;

        if(!paymentSuccessful) {
            await knex('payment_details')
            .insert({
                user_id,
                provider,
                status: 'declined'
            })

            const error = new Error('Payment declined, please try another payment method');
            error.status = 402;
            return done(error);
        }

        // Get payment_id for newly made payment
        const payment = await knex('payment_details')
            .insert({
                user_id,
                provider,
                status: 'completed'
            }, ['id']);

        const payment_id = payment[0].id;
        
        // Add shipping address information to the database and get the address_id
        billing_address.user_id = user_id;

        const shippingAddress = {
            user_id: billing_address.user_id,
            addr_line_1: shipping_address?.addr_line_1 || billing_address.addr_line_1,
            addr_line_2: shipping_address?.addr_line_2 || billing_address.addr_line_2,
            city: shipping_address?.city || billing_address.city,
            state: shipping_address?.state || billing_address.state,
            zip_code: shipping_address?.zip_code || billing_address.zip_code
        }

        // TODO: CHECK DATABASE FOR EXISTING ADDRESS //
        const database_address = await knex('address')
            .where('user_id', '=', shippingAddress.user_id)
            .where('addr_line_1', '=', shippingAddress.addr_line_1)
            .where('city', '=', shippingAddress.city)
            .first('id');

        const shipping_address_id = database_address?.id || (await knex('address')
            .insert(shippingAddress, ['id']))[0].id;
        
        // Add shipping details to the database and get details_id
        const details = await (knex('order_details')
            .insert({
                total_price,
                shipping_address_id,
                shipping_method,
            }, ['id']));

        const details_id = details[0].id;
        
        // Update the database with the new order and get order_id
        const orderId = await knex('order')
            .insert({
                user_id,
                payment_id,
                details_id
            }, ['id'])

        // Add all items from cart to the order
        for (const item of cartItems) {
            item.order_id = orderId[0].id;
        }

        await knex('order_items')
            .insert(cartItems);

        const products = await knex('product')
            .join('order_items', 'product.id', '=', 'order_items.product_id')
            .where('order_items.order_id', '=', orderId[0].id)
            .select({
                id: 'product.id',
                name: 'product.name',
                price: 'product.price',
                qty: 'order_items.quantity'
            })

        const total = total_price;

        // Clear cart
        const rowsAffected = await knex('cart_product')
            .where('cart_id', cartId)
            .del();

        if(rowsAffected < 1) {
            const error = new Error(`Something went wrong!`);
            error.status = 500;
            return done(error);
        }

        const response = { products, total };
        done(null, response);
    } catch (err) {
        done(err);
    }
}

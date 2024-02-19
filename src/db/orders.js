const knexFile = require('../../knexFile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexFile[env];

require('dotenv').config();

const knex = require('knex')(configOptions);

exports.getUserForOrder = async (id, done) => {
  try {
    const user = await knex('user')
      .join('order', 'user.id', '=', 'order.user_id')
      .where('order.id', '=', id)
      .first({ userId: 'user.id' });

    if (!user) {
      const error = new Error(`User with order ID ${id} not found!`);
      error.status = 404;
      return done(error);
    }

    done(null, user.userId);
  } catch (err) {
    done(err);
  }
};

exports.getOrderById = async (orderId, done) => {
  try {
    const orderDetails = await knex('order')
      .join('order_details', 'order.order_details_id', '=', 'order_details.id')
      .join(
        'shipping_details',
        'order.shipping_details_id',
        '=',
        'shipping_details.id'
      )
      .where('order.id', '=', orderId)
      .first({
        id: 'order.id',
        date: 'order_details.created_at',
        total: 'order_details.total_price',
        shipping_status: 'shipping_details.shipping_status',
        payment_status: 'order_details.payment_status',
        tracking_number: 'shipping_details.tracking_number',
      });

    if (!orderDetails) {
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
        qty: 'order_items.quantity',
      });

    const shipping_address = await knex('address')
      .join(
        'shipping_details',
        'address.id',
        '=',
        'shipping_details.shipping_address_id'
      )
      .join('order', 'shipping_details.id', '=', 'order.shipping_details_id')
      .where('order.id', '=', orderId)
      .first('addr_line_1', 'addr_line_2', 'city', 'state', 'zip_code');

    const response = {
      ...orderDetails,
      products,
      shipping_address,
    };

    done(null, response);
  } catch (err) {
    done(err);
  }
};

exports.getOrdersForUser = async (userId, done) => {
  try {
    const orders = await knex('order')
      .join('order_details', 'order.order_details_id', '=', 'order_details.id')
      .join(
        'shipping_details',
        'order.shipping_details_id',
        'shipping_details.id'
      )
      .where('order.user_id', '=', userId)
      .select({
        id: 'order.id',
        date: 'order_details.created_at',
        total: 'order_details.total_price',
        shipping_status: 'shipping_details.shipping_status',
        payment_status: 'order_details.payment_status',
      });

    if (orders.length < 1) {
      const error = new Error(`No orders found for user with id ${userId}!`);
      error.status = 404;
      return done(error);
    }

    done(null, orders);
  } catch (err) {
    done(err);
  }
};

exports.getOrders = async (done) => {
  try {
    const orders = await knex('order')
      .join('order_details', 'order.order_details_id', '=', 'order_details.id')
      .join(
        'shipping_details',
        'order.shipping_details_id',
        'shipping_details.id'
      )
      .select({
        id: 'order.id',
        date: 'order_details.created_at',
        total: 'order_details.total_price',
        shipping_status: 'shipping_details.shipping_status',
        payment_status: 'order_details.payment_status',
      });
    done(null, orders);
  } catch (err) {
    done(err);
  }
};

exports.getFilteredOrders = async (filter, done) => {
  try {
    const orders = await knex('order')
      .join('order_details', 'order.order_details_id', '=', 'order_details.id')
      .join(
        'shipping_details',
        'order.shipping_details_id',
        'shipping_details.id'
      )
      .where('shipping_details.shipping_status', '=', filter)
      .select({
        id: 'order.id',
        date: 'order_details.created_at',
        total: 'order_details.total_price',
        shipping_status: 'shipping_details.shipping_status',
        payment_status: 'order_details.payment_status',
      });
    done(null, orders);
  } catch (err) {
    done(err);
  }
};

exports.getOrderByPaymentIntent = async (paymentIntentId) => {
  try {
    const orderDetailsId = await knex('order_details')
      .where('payment_intent', '=', paymentIntentId)
      .first('id');

    if (!orderDetailsId) {
      const error = new Error(
        `Order with payment_intent id: ${paymentIntentId} does not exist!`
      );
      return [null, error];
    }

    return [orderDetailsId, null];
  } catch (err) {
    console.error(err);
    return [null, err];
  }
};

exports.updatePaymentStatus = async (orderDetailsId, paymentIntentStatus) => {
  try {
    const updateOrder = await knex('order_details')
      .where('id', '=', orderDetailsId)
      .returning('id')
      .update('payment_status', paymentIntentStatus);

    if (updateOrder.length < 1) {
      const error = new Error('Payment status failed to update');
      console.error(error);
    }
    console.log(
      `Payment Status sucessfully updated to "${paymentIntentStatus}"!`
    );
  } catch (err) {
    console.error(err);
  }
};

exports.createNewOrder = async (cartId, paymentIntent) => {
  const payment_intent = paymentIntent.id;
  const payment_status = paymentIntent.status;
  const shipping_address = paymentIntent.shipping.address;
  const service_type = paymentIntent.shipping.carrier;

  try {
    // Check if the cart has items in it
    const cartItems = await knex('cart_product')
      .where('cart_id', '=', cartId)
      .select('product_id', 'quantity');

    if (cartItems.length < 1) {
      const error = new Error('Cannot checkout empty cart!');
      console.error(error);
      return;
    }

    // Get the userId and TotalPrice from the cart
    const { user_id, total_price } = await knex('cart')
      .where('id', '=', cartId)
      .first('user_id', 'total_price');

    // Add shipping address information to the database and get the address_id
    user_id;

    const shippingAddress = {
      user_id: user_id,
      addr_line_1: shipping_address.line1,
      addr_line_2: shipping_address.line2,
      city: shipping_address.city,
      state: shipping_address.state,
      zip_code: shipping_address.postal_code,
    };

    const shippingPrice = await knex('cart')
      .where('id', '=', cartId)
      .first('shipping_price');

    // TODO: CHECK DATABASE FOR EXISTING ADDRESS //
    const database_address = await knex('address')
      .where('user_id', '=', shippingAddress.user_id)
      .where('addr_line_1', '=', shippingAddress.addr_line_1)
      .where('city', '=', shippingAddress.city)
      .first('id');

    const shipping_address_id =
      database_address?.id ||
      (await knex('address').insert(shippingAddress, ['id']))[0].id;

    // Add shipping details to the database and get details_id
    const orderDetails = await knex('order_details').insert(
      {
        total_price,
        payment_intent,
        payment_status: payment_status,
      },
      ['id']
    );

    const order_details_id = orderDetails[0].id;

    const shippingDetails = await knex('shipping_details').insert(
      {
        shipping_address_id,
        shipping_price: shippingPrice.shipping_price,
        service_type,
      },
      ['id']
    );

    const shipping_details_id = shippingDetails[0].id;

    // Update the database with the new order and get order_id
    const orderId = await knex('order').insert(
      {
        user_id,
        order_details_id,
        shipping_details_id,
      },
      ['id']
    );

    // Add all items from cart to the order
    for (const item of cartItems) {
      item.order_id = orderId[0].id;
    }

    await knex('order_items').insert(cartItems);

    // Clear cart
    await knex('cart').where('id', cartId).update({
      payment_intent: null,
      shipping_price: null,
    });

    const rowsAffected = await knex('cart_product')
      .where('cart_id', cartId)
      .del();

    if (rowsAffected < 1) {
      const error = new Error(`Something went wrong!`);
      error.status = 500;
      console.error(error);
      return;
    }
  } catch (err) {
    console.error(err);
  }
};

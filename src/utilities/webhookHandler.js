const { orders, cart } = require('../db/db');

exports.handlePaymentIntentSucceeded = async (paymentIntent) => {
  // Check if processing order already exists
  const [orderDetailsId, error] = await orders.getOrderByPaymentIntent(paymentIntent.id);

  if (error) {
    return;
  }

  if(orderDetailsId) {
    // Update payment_status
    await orders.updatePaymentStatus(orderDetailsId, paymentIntent.status);
  } else {
    // Get User's CartId From Payment Intent
    const [cartId, error3] = await cart.getCartByPaymentIntent(paymentIntent.id);
    // Create new order and clear cart
    await orders.createNewOrder(cartId, paymentIntent);
  }  
  return;
};

exports.handlePaymentIntentProcessing = async (paymentIntent) => {
  // Create new order and clear cart
  await orders.createNewOrder(paymentIntent);
  return;
};

exports.handlePaymentIntentFailed = async (paymentIntent) => {
  // Get the if for the customers order_details
  const [orderDetailsId, error] = await orders.getOrderByPaymentIntent(paymentIntent.id);
  // Update payment_status
  await orders.updatePaymentStatus(orderDetailsId, paymentIntent.status);
  return;
};
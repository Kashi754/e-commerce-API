require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const express = require('express');
const webhookRouter = express.Router();
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const {
  handlePaymentIntentSucceeded,
  handlePaymentIntentProcessing,
  handlePaymentIntentFailed,
  handlePaymentIntentCreated,
  handlePaymentMethodAttached,
  handleChargeSuceeded
} = require('../utilities/webhookHandler');

webhookRouter.post('/', express.raw({type: 'application/json'}), (req, res, next) => {
  let event = req.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse

  if (endpointSecret) {
    // Get the signature sent by Stripe
    console.log('here');
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  console.log(event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_intent.processing':
      const processingPaymentIntent = event.data.object;
      console.log(`PaymentIntent ${processingPaymentIntent.id} for ${processingPaymentIntent.amount} is processing!`);
      handlePaymentIntentProcessing(processingPaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log(`PaymentIntent ${failedPaymentIntent.id} for ${failedPaymentIntent.amount} has failed!`);
      handlePaymentIntentFailed(failedPaymentIntent);
      break;
    case 'payment_intent.created':
      const createdPaymentIntent = event.data.object;
      console.log(`PaymentIntent ${createdPaymentIntent.id} for ${createdPaymentIntent.amount} was created!`);
      handlePaymentIntentCreated(createdPaymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      handlePaymentMethodAttached(paymentMethod);
      break;
    case 'charge.succeeded':
      const charge = event.data.object;
      console.log(`Charge ${charge.id} for PaymentIntent ${charge.payment_intent} for ${charge.amount} for was successful!`);
      handleChargeSuceeded(charge);
      break;


    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 res to acknowledge receipt of the event
  res.status(200).send();

  // await cart.checkoutCart(req.cartId, req.body, async (err, res) => {
  //     if(err) return next(err);

  //     res.json(res);
  // })
});

module.exports = webhookRouter;
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const express = require('express');
const webhookRouter = express.Router();
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const {
  handlePaymentIntentSucceeded,
  handlePaymentIntentProcessing,
  handlePaymentIntentFailed,
} = require('../utilities/webhookHandler');

webhookRouter.post(
  '/',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    let event = req.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse

    if (endpointSecret) {
      // Get the signature sent by Stripe
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

    // Handle the event
    const paymentIntent = event.data.object;
    switch (event.type) {
      case 'payment_intent.processing':
        // Sent when customer initiates a payment, but is yet to complete
        // Usually sent when customer initiates a bank debit
        // Followed by payment_intent.succeded or payment_intent.payment_failed
        // Send payment pending confirmation
        console.log(
          `PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} is processing!`
        );
        handlePaymentIntentProcessing(paymentIntent);
        break;
      case 'payment_intent.succeeded':
        // Sent when customer successfully completes a payment
        // Send an order confirmation and fulfill their order
        console.log(
          `PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        // Sent when customer attempts a payment, but it fails
        console.log(
          `PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} has failed!`
        );
        handlePaymentIntentFailed(paymentIntent);
        break;

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 res to acknowledge receipt of the event
    res.status(200).send();
  }
);

module.exports = webhookRouter;

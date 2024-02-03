const express = require('express');

const webhookRouter = express.Router();

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;


webhookRouter.post('/', async (req, res, next) => {

    const event = req.body;
    
    if(endpointSecret) {
      const sig = request.headers['stripe-signature'];
  
      try {
          event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      } catch (err) {
          console.log('Webhook signature verification failed', err.message);
          err.status = 400;
          return next(err);
      }
  
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          handlePaymentIntentSucceded(paymentIntent);
          break;
        case 'payment_intent.processing':
          const processingPaymentIntent = event.data.object;
          handlePaymentIntentProcessing(processingPaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          handlePaymentIntentFailed(failedPaymentIntent);
          break;
        default:
        console.log(`Unhandled event type ${event.type}`);
      }
    }

    

    // Return a 200 response to acknowledge receipt of the event
    response.send();

    // await cart.checkoutCart(req.cartId, req.body, async (err, response) => {
    //     if(err) return next(err);

    //     res.json(response);
    // })
});

module.exports = webhookRouter;
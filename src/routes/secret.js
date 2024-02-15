const express = require('express');
const verifyUserLoggedIn = require('../middleware/verifyUserLoggedIn');
const { getCartById } = require('../db/cart');
const unformat = require('../utilities/unformat');

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const secretRouter = express.Router();

secretRouter.get('/', async (req, res, next) => {
  const totalPrice = parseFloat(req.query.total) * 100;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });
  
    const intent = paymentIntent;
    res.json({client_secret: intent.client_secret});
  } catch(err) {
    console.log(err);
    err.status = 500;
    return next(err);
  }
});


module.exports = secretRouter;
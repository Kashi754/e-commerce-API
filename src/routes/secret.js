const express = require('express');
const verifyUserLoggedIn = require('../middleware/verifyUserLoggedIn');
const cart = require('../db/db').cart;

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const secretRouter = express.Router();

secretRouter.get('/', async (req, res, next) => {
    const totalPrice = Number(req.query.total);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const intent = paymentIntent;
    res.json({client_secret: intent.client_secret});
});


module.exports = secretRouter;
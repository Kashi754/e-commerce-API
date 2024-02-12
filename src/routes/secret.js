const express = require('express');
const verifyUserLoggedIn = require('../middleware/verifyUserLoggedIn');
const { getCartById } = require('../db/cart');
const unformat = require('../utilities/unformat');

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const secretRouter = express.Router();

secretRouter.get('/', async (req, res, next) => {
  let cart;
  await getCartById(req.user.cartId, (err, cartFromDb) => {
    if(err) {
      return next(err);
    }

    cart=cartFromDb;
  });

  console.log(cart);

  const totalPrice = unformat(cart.total);
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
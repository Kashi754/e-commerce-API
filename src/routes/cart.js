const express = require('express');
const {
  fetchShippingServiceTypes,
  fetchTransitTimes,
  fetchShippingRates,
} = require('../utilities/shippingUtilities');
const cart = require('../db/db').cart;

const cartRouter = express.Router();

cartRouter.get('/', async (req, res, next) => {
  await cart.getCartById(req.user.cartId, (err, cart) => {
    if (err) return next(err);
    res.json(cart);
  });
});

cartRouter.post('/', async (req, res, next) => {
  const itemData = req.body;

  await cart.addItemToCart(req.user.cartId, itemData, async (err) => {
    if (err) return next(err);

    await cart.getCartById(req.user.cartId, (err, cart) => {
      if (err) return next(err);
      res.json(cart);
    });
  });
});

cartRouter.put('/', async (req, res, next) => {
  const itemData = req.body;

  await cart.editCartProduct(req.user.cartId, itemData, async (err) => {
    if (err) return next(err);

    await cart.getCartById(req.user.cartId, (err, cart) => {
      if (err) return next(err);
      res.json(cart);
    });
  });
});

cartRouter.delete('/', async (req, res, next) => {
  const productId = req.query.product_id;

  if (!productId) {
    const error = new Error('Please input a number for the product ID!');
    error.status = 400;
    return next(error);
  }

  await cart.deleteCartProduct(req.user.cartId, productId, async (err) => {
    if (err) return next(err);

    await cart.getCartById(req.user.cartId, (err, cart) => {
      if (err) return next(err, cart);
      res.json(cart);
    });
  });
});

cartRouter.post('/checkout', async (req, res, next) => {
  await cart.createPaymentIntent(
    req.user.cartId,
    req.body.paymentIntent,
    async (err, response) => {
      if (err) return next(err);
      res.json(response);
    }
  );
});

// Retrieves Fedex API access token
cartRouter.get('/shipping', async (req, res, next) => {
  const fedexApiCredentials = {
    grant_type: 'client_credentials',
    client_id: process.env.FEDEX_API_KEY,
    client_secret: process.env.FEDEX_SECRET_KEY,
  };

  const formBody = new URLSearchParams(fedexApiCredentials);

  const url = 'https://apis-sandbox.fedex.com';
  const path = '/oauth/token';

  const response = await fetch(url + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  if (!response.ok) {
    const error = await response.json();
    error.status = 500;
    return next(error);
  }

  const data = await response.json();

  const currentTime = Date.now();

  const token = {
    accessToken: data.access_token,
    expiresAt: currentTime + data.expires_in * 1000,
    scope: data.scope,
  };

  res.json(token);
});

// Retrieves shipping services with rates and transit times from Fedex API
cartRouter.post('/shipping', async (req, res) => {
  const { cartInfo, zip, accessToken } = req.body;
  const serviceTypes = await fetchShippingServiceTypes(cart, zip, accessToken);
  // Returns { serviceType, serviceName, transitDays}
  const transitTimes = await fetchTransitTimes(
    cartInfo,
    zip,
    accessToken,
    serviceTypes
  );
  // Returns { serviceType, totalCharge }
  const shippingRates = await fetchShippingRates(
    cartInfo,
    zip,
    accessToken,
    serviceTypes,
    'LIST'
  );

  // Merges transitTimes and shippingRates into an array of combined objects for each service type
  const shippingInfo = [];

  for (const shippingRate of shippingRates) {
    for (const transitTime of transitTimes) {
      if (shippingRate.serviceType !== transitTime.serviceType) continue;
      shippingInfo.push({
        serviceType: shippingRate.serviceType,
        serviceName: transitTime.serviceName,
        transitDays: transitTime.transitDays,
        totalCharge: shippingRate.totalCharge,
      });
    }
  }

  res.json(shippingInfo);
});

cartRouter.patch('/shipping', async (req, res, next) => {
  const { shippingPrice } = req.body;

  await cart.updateShippingPrice(req.user.cartId, shippingPrice, (err, msg) => {
    if (err) return next(err);
    res.status(201).json(msg);
  });
});

module.exports = cartRouter;

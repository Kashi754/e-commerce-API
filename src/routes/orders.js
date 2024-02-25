const express = require('express');
const orders = require('../db/db').orders;

const ordersRouter = express.Router();

async function verifyUserOrder(req, res, next) {
  const orderId = Number(req.params.orderId);

  if (!orderId) {
    const error = new Error('Please input a number for order ID');
    error.status = 400;
    return next(error);
  }

  await orders.getUserForOrder(orderId, (err, userId) => {
    if (err) return next(err);

    if (req.user.id !== userId && req.user.role !== 'admin') {
      const error = new Error('Permission Denied!');
      error.status = 403;
      return next(error);
    }
    req.orderId = orderId;

    next();
  });
}

ordersRouter.get('/', async (req, res, next) => {
  const userId = req.query.userId || req.user.id;

  if (req.query.userId && req.user.role !== 'admin') {
    const error = new Error(`No orders found for user with id ${userId}!`);
    error.status = 404;
    console.error(error);
    return next(error);
  }

  await orders.getOrdersForUser(userId, (err, orders) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.json(orders);
  });
});

ordersRouter.get('/admin', async (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }
  const { filter } = req.query || null;

  if (filter === 'pending' || filter === 'shipped' || filter === 'delivered') {
    await orders.getFilteredOrders(filter, (err, orders) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      res.json(orders);
    });
  } else if (filter) {
    await orders.getOrderById(filter, (err, order) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      res.json([order]);
    });
  } else {
    await orders.getOrders((err, orders) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      res.json(orders);
    });
  }
});

ordersRouter.get('/:orderId', verifyUserOrder, async (req, res, next) => {
  await orders.getOrderById(req.orderId, (err, order) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.json(order);
  });
});

module.exports = ordersRouter;

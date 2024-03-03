const express = require('express');
const verifyUserIsAdmin = require('../middleware/verifyUserIsAdmin');
const orders = require('../db/db').orders;

const ordersRouter = express.Router();

async function verifyUserOrder(req, res, next) {
  const orderId = req.params.orderId;

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
  let userId = req.query.userId || req.user.id;

  if (req.query.userId && req.user.role !== 'admin') {
    userId = req.user.id;
  }

  await orders.getOrdersForUser(userId, (err, orders) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.json(orders);
  });
});

ordersRouter.get('/admin', verifyUserIsAdmin, async (req, res, next) => {
  const { filter } = req.query || null;

  if (filter) {
    await orders.getFilteredOrders(filter, (err, orders) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      res.json(orders);
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

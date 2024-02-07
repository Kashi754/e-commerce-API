const express = require('express');
const orders = require('../db/db').orders;

const ordersRouter = express.Router();

async function verifyUserOrder(req, res, next) {
    const orderId = Number(req.params.orderId);

    if(!orderId) {
        const error = new Error('Please input a number for order ID');
        error.status = 400;
        return next(error);
    }

    await orders.getUserForOrder(orderId, (err, userId) => {
        if(err) return next(err);
        
        if(req.user.id != userId && req.user.role != 'admin') {
            const error = new Error("You do not have permission to interact with order with that ID!");
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
        console.log(error);
        return next(error);
    }

    await orders.getOrdersForUser(userId, (err, orders) => {
        if(err) {
            console.log(err);
            return next(err);
        };
        res.json(orders);
    });
});

ordersRouter.get('/:orderId', verifyUserOrder, async (req, res, next) => {
    const userId = req.query.userId || req.user.id;
    await orders.getOrderById(req.orderId, userId, (err, order) => {
        if(err) {
            console.log(err);
            return next(err);
        }
        res.json(order);
    });
});


module.exports = ordersRouter;
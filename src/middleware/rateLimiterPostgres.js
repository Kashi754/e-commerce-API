const { knex } = require('../db/db');
const { RateLimiterPostgres } = require('rate-limiter-flexible');

const createRateLimiter = async (opts) => {
  return new Promise((resolve, reject) => {
    let rateLimiter;
    const ready = (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(rateLimiter);
      }
    };

    rateLimiter = new RateLimiterPostgres(opts, ready);
  });
};

const rateLimiterMiddleware = async (req, res, next) => {
  const opts = {
    storeClient: knex,
    storeType: 'knex',
    points: 300,
    duration: 60,
    inMemoryBlockOnConsumed: 300,
  };

  const rateLimiter = await createRateLimiter(opts);
  const key = req.user.id ? req.user.id : req.ip;
  if (req.path.indexOf('/images') === 0) {
    const pointsToConsume = req.userId ? 1 : 5;
    rateLimiter
      .consume(key, pointsToConsume)
      .then(() => {
        next();
      })
      .catch((rateLimiterRes) => {
        const headers = {
          'Retry-After': rateLimiterRes.msBeforeNext / 1000,
          'X-RateLimit-Limit': opts.points,
          'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
          'X-RateLimit-Reset': new Date(
            Date.now() + rateLimiterRes.msBeforeNext
          ),
        };
        res.status(429).set(headers).json({
          status: 429,
          message: 'Too Many Requests',
        });
      });
  } else {
    const pointsToConsume = req.userId ? 1 : 30;
    rateLimiter
      .consume(key, pointsToConsume)
      .then(() => {
        next();
      })
      .catch((rateLimiterRes) => {
        const headers = {
          'Retry-After': rateLimiterRes.msBeforeNext / 1000,
          'X-RateLimit-Limit': opts.points,
          'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
          'X-RateLimit-Reset': new Date(
            Date.now() + rateLimiterRes.msBeforeNext
          ),
        };
        res.status(429).set(headers).json({
          status: 429,
          message: 'Too Many Requests',
        });
      });
  }
};

module.exports = rateLimiterMiddleware;

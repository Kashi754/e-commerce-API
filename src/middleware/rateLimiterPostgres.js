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
    points: 40,
    duration: 1,
    blockDuration: 6 * 5,
    inMemoryBlockOnConsumed: 41,
  };

  const rateLimiter = await createRateLimiter(opts);
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((rateLimiterRes) => {
      const headers = {
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Limit': opts.points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      };
      res.status(429).set(headers).json({
        status: 429,
        message: 'Too Many Requests',
      });
    });
};

module.exports = rateLimiterMiddleware;

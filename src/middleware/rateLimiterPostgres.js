const { knex } = require('../db/db');
const {
  RateLimiterPostgres,
  RLWrapperBlackAndWhite,
} = require('rate-limiter-flexible');

const createRateLimiter = async (opts, req) => {
  const expectedUrl = 'https://e-commerce-app-frontend-e50n.onrender.com';
  const expectedHostname = new URL(expectedUrl).hostname;

  return new Promise((resolve, reject) => {
    let rateLimiter;
    const ready = (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(rateLimiterWrapped);
      }
    };

    rateLimiter = new RateLimiterPostgres(opts, ready);

    const whitelist = ['::1', '216.24.57.252:443'];

    if (
      whitelist.indexOf(req.get('host')) === -1 &&
      req.get('host') === expectedHostname &&
      req.protocol === 'https'
    ) {
      whitelist.push(req.ip);
    }

    const rateLimiterWrapped = new RLWrapperBlackAndWhite({
      limiter: rateLimiter,
      whiteList: whitelist,
      blackList: [],
    });
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

  const rateLimiter = await createRateLimiter(opts, req);
  const key = req.ip;
  if (req.path.indexOf('/images') === 0) {
    const pointsToConsume = req.user ? 1 : 5;
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
    const pointsToConsume = req.user ? 1 : 30;
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

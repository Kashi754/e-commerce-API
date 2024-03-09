const { knex } = require('../db/db');
const { RateLimiterPostgres } = require('rate-limiter-flexible');

const maxConsecutiveFailsByUsername = 5;

const limiterConsecutiveFailsByUsername = new RateLimiterPostgres({
  storeClient: knex,
  storeType: 'knex',
  keyPrefix: 'consecutiveFailsByUsername',
  points: maxConsecutiveFailsByUsername,
  duration: 60 * 60 * 3, // Store number for three hours since first fail
  blockDuration: 60 * 15, // Block for 15 minutes
});

async function limitLoginRequests(req, res, next) {
  const username = req.body.username;
  const rlResUsername = await limiterConsecutiveFailsByUsername.get(username);

  if (
    rlResUsername !== null &&
    rlResUsername.consumedPoints > maxConsecutiveFailsByUsername
  ) {
    const retrySecs = Math.round(rlResUsername.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(retrySecs));
    res.status(429).send({
      status: 429,
      message: 'Too Many Requests',
    });
  } else {
    req.userLogin = username;
    next();
  }
}

module.exports = {
  limiterConsecutiveFailsByUsername,
  maxConsecutiveFailsByUsername,
  limitLoginRequests,
};

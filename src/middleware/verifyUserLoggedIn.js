const verifyUserLoggedIn = (req, res, next) => {
  if (!req.user) {
    const error = new Error('Please log in!');
    error.status = 401;
    return next(error);
  }
  next();
};

module.exports = verifyUserLoggedIn;

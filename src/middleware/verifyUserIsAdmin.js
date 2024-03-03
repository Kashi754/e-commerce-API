function verifyUserIsAdmin(req, res, next) {
  if (req.user.role != 'admin') {
    const error = new Error('Permission Denied!');
    error.status = 403;
    return next(error);
  }
  next();
}

module.exports = verifyUserIsAdmin;

function verifyUserIsAdmin(req, res, next) {
    if(req.user.role != 'admin') {
        const error = new Error("You do not have permission to do that!");
        error.status = 403;
        return next(error);
    }
    next();
}

module.exports = verifyUserIsAdmin;
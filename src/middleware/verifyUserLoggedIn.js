const verifyUserLoggedIn = (req, res, next) => {
    if(!req.user) {
        const error = new Error("Please log in!");
        return next(error);
    }
    next();
}

module.exports = verifyUserLoggedIn;
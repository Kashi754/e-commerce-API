const verifyUserLoggedIn = (req, res, next) => {
    if(!req.user) {
        console.log(req);
        const error = new Error("Please log in!");
        return next(error);
    }
    next();
}

module.exports = verifyUserLoggedIn;
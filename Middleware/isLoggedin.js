function isLoggedin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  } else {
    return next();
  }
}

module.exports = isLoggedin;

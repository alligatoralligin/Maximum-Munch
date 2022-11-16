function isOwner(req, res, next) {
  if (!req.session.owner) {
    res.redirect("/Owner/login");
  } else {
    return next();
  }
}

module.exports = isOwner;

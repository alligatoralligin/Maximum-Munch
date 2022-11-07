function isOwner(req, res, next) {
  if (!req.session.owner) {
    res.redirect("/ownerLogin");
  } else {
    return next();
  }
}

module.exports = isOwner;

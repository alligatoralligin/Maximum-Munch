const express = require("express");
const router = express.Router();
const { restaurant } = require("../Schemas/restaurantSchema");
const { food } = require("../Schemas/foodSchema");
const { user, customer, restOwner } = require("../Schemas/userSchema");
const passport = require("passport");

function wrapperFn(fn) {
  return function (req, res, next) {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get("/index", async (req, res) => {
  const restaurants = await restaurant.find({});
  // console.log(restaurants);
  res.render("index.ejs", { restaurants });
});

router.get("/Register", async (req, res) => {
  res.render("newOwner.ejs");
});

router.post("/Register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  restOwner.register(
    new restOwner({ username: req.body.username, Owner: true }),
    password,
    function (err) {
      if (err) {
        console.log("error while user register!", err);
        return next(err);
      }
    }
  );
  console.log("owner registered");
  res.send("new owner account created");
});

router.get("/Login", async (req, res) => {
  res.render("ownerLogin.ejs");
});

router.post(
  "/Login",
  passport.authenticate("local", { failureRedirect: "/Owner/Login" }),
  async (req, res) => {
    const foundUser = await user.findOne({ username: req.body.username });
    if (foundUser.Owner) {
      req.session.owner = true;
    }
    console.log(foundUser);
    console.log("you have logged in as a restaurant owner!");
    res.redirect("/index");
  }
);

module.exports = router;

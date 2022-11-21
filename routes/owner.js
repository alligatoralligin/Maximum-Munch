const express = require("express");
const router = express.Router();
const { restaurant } = require("../Schemas/restaurantSchema");
const { food } = require("../Schemas/foodSchema");
const { user, customer, restOwner } = require("../Schemas/userSchema");
const passport = require("passport");
const isLoggedin = require("../Middleware/isLoggedin.js");
const isOwner = require("../Middleware/isOwner.js");

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
  res.render("owner.ejs", { restaurants });
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
  res.redirect("/index");
});

router.get("/Login", async (req, res) => {
  res.render("ownerLogin.ejs");
});

router.post(
  "/Login",
  passport.authenticate("local", { failureRedirect: "/Owner/Login" }),
  async (req, res) => {
    const foundUser = await user.findOne({ username: req.body.username });
    if (!foundUser.Owner) {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        console.log("You have logged out");
      });
      res.redirect("/login");
    } else {
      if (foundUser.Owner) {
        req.session.owner = true;
        req.session.username = req.body.username;
      }
      console.log(foundUser);
      console.log("you have logged in as a restaurant owner!");
      res.redirect("/index");
    }
  }
);

router.get("/newRestaurant", async (req, res) => {
  res.render("ownerNewRest.ejs");
});

router.post("/newRestaurant", isLoggedin, isOwner, async (req, res) => {
  const targetUser = req.session.username;
  const foundUser = await user.findOne({ username: targetUser });
  const createdRestaurant = await restaurant.create(req.body);
  foundUser.restOwned.push(createdRestaurant._id);
  console.log(createdRestaurant);
  res.send("new restaurant created");
});

module.exports = router;

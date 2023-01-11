const express = require("express");
const router = express.Router();
const { restaurant } = require("../Schemas/restaurantSchema");
const { food } = require("../Schemas/foodSchema");
const { user, customer, restOwner } = require("../Schemas/userSchema");
const passport = require("passport");
const isLoggedin = require("../Middleware/isLoggedin.js");
const isOwner = require("../Middleware/isOwner.js");

router.get("/Japanese", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Japanese" });
  await console.log(findRest);
  res.render("cuisineCategory/japanese.ejs", { findRest });
});

router.get("/Chinese", async (req, res, next) => {
  // Chinese has an extra space in schema ********** need to remove
  const findRest = await restaurant.find({ speciality: "Chinese " });
  await console.log(findRest);
  res.render("cuisineCategory/chinese.ejs", { findRest });
});

router.get("/Korean", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Korean" });
  await console.log(findRest);
  res.render("cuisineCategory/korean.ejs", { findRest });
});
router.get("/Mexican", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Mexican" });
  await console.log(findRest);
  res.render("cuisineCategory/mexican.ejs", { findRest });
});
router.get("/Italian", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Italian" });
  await console.log(findRest);
  res.render("cuisineCategory/italian.ejs", { findRest });
});
router.get("/French", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "French" });
  await console.log(findRest);
  res.render("cuisineCategory/french.ejs", { findRest });
});
router.get("/Greek", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Greek" });
  await console.log(findRest);
  res.render("cuisineCategory/greek.ejs", { findRest });
});
router.get("/Thai", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Thai" });
  await console.log(findRest);
  res.render("cuisineCategory/thai.ejs", { findRest });
});
router.get("/Indian", async (req, res, next) => {
  const findRest = await restaurant.find({ speciality: "Indian" });
  await console.log(findRest);
  res.render("cuisineCategory/indian.ejs", { findRest });
});

module.exports = router;

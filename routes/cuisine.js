const express = require("express");
const router = express.Router();
const { restaurant } = require("../Schemas/restaurantSchema");
const { food } = require("../Schemas/foodSchema");
const { user, customer, restOwner } = require("../Schemas/userSchema");
const passport = require("passport");
const isLoggedin = require("../Middleware/isLoggedin.js");
const isOwner = require("../Middleware/isOwner.js");

router.get("/Japanese", async (req, res, next) => {
  const pickedCuisine = "Japanese";
  const findRest = await restaurant.find({ speciality: pickedCuisine });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/Chinese", async (req, res, next) => {
  // Chinese has an extra space in schema ********** need to remove
  const pickedCuisine = "Chinese ";
  const findRest = await restaurant.find({ speciality: pickedCuisine });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});

router.get("/Korean", async (req, res, next) => {
  const pickedCuisine = "Korean";
  const findRest = await restaurant.find({ speciality: "Korean" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/Mexican", async (req, res, next) => {
  const pickedCuisine = "Mexican";
  const findRest = await restaurant.find({ speciality: "Mexican" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/Italian", async (req, res, next) => {
  const pickedCuisine = "Italian";
  const findRest = await restaurant.find({ speciality: "Italian" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/French", async (req, res, next) => {
  const pickedCuisine = "French";
  const findRest = await restaurant.find({ speciality: "French" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/Greek", async (req, res, next) => {
  const pickedCuisine = "Greek";
  const findRest = await restaurant.find({ speciality: "Greek" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/Thai", async (req, res, next) => {
  const pickedCuisine = "Thai";
  const findRest = await restaurant.find({ speciality: "Thai" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});
router.get("/Indian", async (req, res, next) => {
  const pickedCuisine = "Indian";
  const findRest = await restaurant.find({ speciality: "Indian" });
  await console.log(findRest);
  res.render("cuisineCategory/categoryTemp.ejs", { findRest, pickedCuisine });
});

module.exports = router;

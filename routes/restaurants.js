const express = require("express");
const router = express.Router();
const { restaurant } = require("../Schemas/restaurantSchema");
const { food } = require("../Schemas/foodSchema");
const { user, customer, restOwner } = require("../Schemas/userSchema");
const isOwner = require("../Middleware/isOwner");
const wrapperFn = require("../HelperFn/tryCatch");
const { ErrorHandler } = require("../Errorhandler/Errorhandler");

router.get("/:id", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  if (findRest.foods.length > 0) {
    const foodList = await findRest.populate("foods");
  }
  var ownsRest = false;
  if (req.session.username) {
    const foundUser = await user.findOne({ username: req.session.username });
    if (foundUser.restOwned) {
      const ownedRests = foundUser.restOwned;
      if (ownedRests.includes(req.params.id)) {
        ownsRest = true;
      }
    }
  }
  // console.log(req.session.owner);
  res.render("showPage.ejs", { findRest, ownsRest });
});

router.get("/:id/edit", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  res.render("editPage.ejs", { findRest });
});

router.get(
  "/:id/addFood",
  wrapperFn(async (req, res) => {
    const findRest = await restaurant.findById(req.params.id);
    res.render("addFood.ejs", { findRest });
  })
);

router.post(
  "/:id/addFood",
  wrapperFn(async (req, res) => {
    const findRest = await restaurant.findById(req.params.id);
    const newFood = req.body;
    const allFoods = await findRest.populate("foods", "name");
    const populatedFood = allFoods.foods;
    var found = false;
    for (var i = 0; i < populatedFood.length; i++) {
      if (populatedFood[i].name == req.body.name) {
        found = true;
        break;
      }
    }
    if (!req.body.name) {
      throw new Error("There is no name to your food item");
    }
    if (!req.body.price) {
      throw new Error("There is no price to your food item");
    }
    if (!req.body.Cuisine) {
      throw new Error("There is no cuisine to your food item");
    }
    if (found === true) {
      throw new Error(
        "There is already an item with this name at this restaurant"
      );
    }
    const createFood = await food.create(newFood);
    findRest.foods.push(createFood._id);
    await findRest.save();
    res.redirect(`/restaurants/${req.params.id}`);
  })
);

router.post("/:id", async (req, res) => {
  const findRest = await restaurant.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/restaurants/${req.params.id}`);
});

router.get("/:id/editFood/:food_id", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  const findFood = await food.findById(req.params.food_id);
  res.render("editFood.ejs", { findFood, findRest });
});

router.post("/:id/editFood/:food_id", async (req, res) => {
  // const findRest = await restaurant.findById(req.params.id);
  const findFood = await food.findById(req.params.food_id);
  const newfood = req.body;
  const updatedFood = await food.findByIdAndUpdate(findFood, newfood);
  console.log(newfood);
  res.send("You have reached edit Food post route");
});

router.post("/");

router.delete("/:id/foods/:food_id", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  const deletedFood = await food.deleteOne({ _id: req.params.food_id });
  const index = findRest.foods.length;
  if (index > -1) {
    findRest.foods.pull(req.params.food_id);
    findRest.save();
  }
  console.log(deletedFood);
  res.redirect(`/restaurants/${req.params.id}`);
});

module.exports = router;

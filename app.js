const express = require("express");
const path = require("path");
const { restaurant } = require("./Schemas/restaurantSchema");
const mongoose = require("mongoose");
const { food } = require("./Schemas/foodSchema");
const bodyParser = require("body-parser");
const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(jsonParser);
app.use(urlencodedParser);

mongoose
  .connect("mongodb://localhost:27017/MaximumMunch", { useNewUrlParser: true })
  .then(() => {
    console.log("open connection");
  })
  .catch(() => {
    console.log("error");
  });

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/home", function (req, res) {
  res.render("home.ejs");
});

app.get("/index", async (req, res) => {
  const restaurants = await restaurant.find({});
  console.log(restaurants);
  res.render("index.ejs", { restaurants });
});

app.get("/restaurants/:id", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  const foodList = await findRest.populate("foods");
  res.render("showPage.ejs", { findRest });
});

app.get("/restaurants/:id/edit", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  res.render("editPage.ejs", { findRest });
});

app.get("/restaurants/:id/addFood", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  res.render("addFood.ejs", { findRest });
});

app.post("/restaurants/:id/addFood", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  newFood = req.body;
  const createFood = await food.create(newFood);
  findRest.foods.push(createFood._id);
  await findRest.save();
  res.send("add food post worked");
});

app.post("/restaurants/:id", async (req, res) => {
  const findRest = await restaurant.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/restaurants/${req.params.id}`);
});

app.listen("3000", () => {
  console.log("Connecting to port 3000");
});

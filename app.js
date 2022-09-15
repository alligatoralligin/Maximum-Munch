const express = require("express");
const app = express();
const path = require("path");
const { restaurant } = require("./Schemas/restaurantSchema");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
  res.render("index.ejs", { restaurants });
});

app.get("/restaurants/:id", async (req, res) => {
  const findRest = await restaurant.findById(req.params.id);
  console.log(findRest);
  res.render("showPage.ejs");
});

app.listen("3000", () => {
  console.log("Connecting to port 3000");
});

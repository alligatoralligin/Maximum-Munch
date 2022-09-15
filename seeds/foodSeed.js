const mongoose = require("mongoose");
const { food } = require("../Schemas/foodSchema");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/MaximumMunch");
  console.log("connected to mongoDB");
}

food
  .deleteMany({})
  .then(() => {
    console.log("Data deleted");
  })
  .catch((e) => {
    console.log(e);
  });

async function newFood() {
  createdFood = await food.create({
    name: "Pizza",
    price: "8.99",
    Cuisine: "Italian",
    Restaurant: "PizzaPizza",
  });
  console.log(createdFood);
}

newFood();

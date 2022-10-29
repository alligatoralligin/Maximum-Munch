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
    foodPhoto:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
  });
  console.log(createdFood);
}

newFood();

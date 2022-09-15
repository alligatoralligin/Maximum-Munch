const mongoose = require("mongoose");
const { restaurant } = require("../Schemas/restaurantSchema");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/MaximumMunch");
  console.log("connected to mongoDB");
}

restaurant
  .deleteMany({})
  .then(() => {
    console.log("Data deleted");
  })
  .catch((e) => {
    console.log(e);
  });

async function newRest() {
  createdRest = await restaurant.create({
    name: "SushiLegend",
    location: "Scarborough, Toronto",
    speciality: "Japanese",
    rating: "4",
  });
  console.log(createdRest);
}

newRest();

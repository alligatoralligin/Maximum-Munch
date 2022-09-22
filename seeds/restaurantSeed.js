const mongoose = require("mongoose");
const { restaurant } = require("../Schemas/restaurantSchema");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/MaximumMunch");
  console.log("connected to mongoDB");
}
// function cleanseDocs() {
//   restaurant
//     .deleteMany({})
//     .then(() => {
//       console.log("Data deleted");
//     })
//     .catch((e) => {
//       console.log(e);
//     });
// }

// cleanseDocs();

async function newRest() {
  await restaurant.deleteMany({});
  console.log("deleted all docs");
  createdRest = await restaurant.insertMany([
    {
      name: "SushiLegend",
      location: "Scarborough, Toronto",
      speciality: "Japanese",
      rating: "4",
    },
    {
      name: "Taco Bell",
      location: "Scarborough, Toronto",
      speciality: "Mexican",
      rating: "2",
    },
  ]);
  console.log(createdRest);
}

newRest();

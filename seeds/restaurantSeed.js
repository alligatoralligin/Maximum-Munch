const mongoose = require("mongoose");
const { restaurant } = require("../Schemas/restaurantSchema");
const { food } = require("../Schemas/foodSchema");
const { faker } = require("@faker-js/faker");

// Using faker.js to generate majority of the fake data for demonstration purposes
// the exception being the speciality of the restaurant which will be an enum that will have to
const specialityList = [
  "Japanese",
  "Chinese ",
  "Korean",
  "Mexican",
  "Italian",
  "French",
  "Greek",
  "Thai",
  "Indian",
];

const foodList = [
  "Taco soup",
  "Minestrone soup",
  "Chicken noodle soup ",
  "Creamy potato soup",
  "White chicken chili",
  "Clam chowder",
  "Tomato bisque",
  "Italian wedding soup",
  "Chicken enchilada/tortilla soup",
  "Cheeseburger soup",
  "Corn chowder ",
  "Tortellini soup",
  "French onion soup",
  "Jambalaya",
  "Homemade mac ‘n cheese ",
  "Lasagna",
  "Baked ziti",
  "Fettuccine Alfredo ",
  "Rotini bake",
  "Vegetable lasagna",
  "Lasagna rolls ",
  "Bolognese sauce and pasta",
  "Spinach-bacon mac ‘N cheese",
  "Tomato-bacon pasta",
  "Stuffed pasta shells",
  "Manicotti",
  "Spaghetti and meatballs ",
  "Pesto pasta",
  "Eggplant parmesan",
  "Tortellini",
  "Stroganoff ",
  "Crockpot Alfredo lasagna",
  "Sausage & pepper pasta",
  "Pad Thai",
  "Bowtie pasta & vegetables",
];

function randomize(list) {
  const randomNumber = Math.floor(Math.random() * list.length);
  return list[randomNumber];
}
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
const foodCategories = [
  "Large Subs",
  "Small Subs",
  "Noodle dishes",
  "rice dishes",
  "burgers",
  "kids meal",
  "Salads",
  "Sushi",
  "Wraps",
  "Healthy Foods",
  "Sides",
  "Soft Drinks",
  "Pizzas",
  "Steaks",
  "Sauces",
];

async function newRest() {
  await restaurant.deleteMany({});
  console.log("deleted all docs");
  for (let i = 0; i < 60; i++) {
    const createRest = await restaurant.create({
      name: faker.company.name(),
      location: faker.address.cityName(),
      speciality: randomize(specialityList),
      rating: Math.floor(Math.random() * 5 + 1),
      photo: faker.image.city(640, 500, true),
    });
    for (let x = 0; x < 25; x++) {
      const createFood = await food.create({
        name: randomize(foodList),
        price: Math.floor(Math.random() * 30 + 1),
        Cuisine: randomize(specialityList),
        foodPhoto: faker.image.imageUrl(640, 480, "food", true),
        foodCategory:
          foodCategories[Math.floor(Math.random() * foodCategories.length + 1)],
      });
      const restInfo = await food.findByIdAndUpdate(createFood.id, {
        Restaurant: createRest.name,
      });
      createRest.foods.push(createFood._id);
      await restInfo.save();
      await createRest.save();
    }
  }
  // createdRest = await restaurant.insertMany([
  //   {
  //     name: "SushiLegend",
  //     location: "Scarborough, Toronto",
  //     speciality: "Japanese",
  //     rating: "4",
  //   },
  //   {
  //     name: "Taco Bell",
  //     location: "Scarborough, Toronto",
  //     speciality: "Mexican",
  //     rating: "2",
  //   },
  // ]);
  // console.log(createdRest);
  console.log("done");
}

newRest();

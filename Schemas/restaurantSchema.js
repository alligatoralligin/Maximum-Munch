const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { food } = require("./foodSchema");

const restaurantSchema = new Schema({
  name: { type: String, required: true },
  location: String,
  speciality: {
    type: String,
    enum: [
      "Japanese",
      "Chinese ",
      "Korean",
      "Mexican",
      "Italian",
      "French",
      "Greek",
      "Thai",
      "Indian",
    ],
  },
  rating: Number,
  foods: [
    {
      type: Schema.Types.ObjectId,
      ref: "food",
    },
  ],
});

const restaurant = mongoose.model("restaurant", restaurantSchema);

module.exports.restaurant = restaurant;

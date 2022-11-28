const options = { discrimnatorKey: "kind" };
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const { restaurant } = require("./restaurantSchema");

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String },
  foodCart: [
    {
      type: Schema.Types.ObjectId,
      ref: "Food",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
module.exports.user = User;

const restOwner = User.discriminator(
  "restaurantOwner",
  new mongoose.Schema({
    Owner: Boolean,
    restOwned: [{ type: Schema.Types.ObjectId, ref: "restaurant" }],
  })
);

module.exports.restOwner = restOwner;

const customer = User.discriminator(
  "customer",
  new mongoose.Schema({ customer: Boolean })
);

module.exports.customer = customer;

const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const { restaurant } = require("./restaurantSchema");

const options = {
  discrimnatorKey: "kind",
  errorMessages: {
    MissingPasswordError: "No password was given",
    AttemptTooSoonError: "Account is currently locked. Try again later",
    TooManyAttemptsError:
      "Account locked due to too many failed login attempts",
    NoSaltValueStoredError: "Authentication not possible. No salt value stored",
    IncorrectPasswordError: "Password or username are incorrect",
    IncorrectUsernameError: "Password or username are incorrect",
    MissingUsernameError: "No username was given",
    UserExistsError: "A user with the given username is already registered",
  },
};
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

userSchema.plugin(passportLocalMongoose, options);
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

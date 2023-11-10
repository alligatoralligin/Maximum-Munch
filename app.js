const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const carouselCuisineList = require("./categoryData/carouselImages");
const { restaurant } = require("./Schemas/restaurantSchema");
const { food } = require("./Schemas/foodSchema");
const { user, customer, restOwner } = require("./Schemas/userSchema");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const restaurantsRouter = require("./routes/restaurants");
const ownerRouter = require("./routes/owner");
const cuisineRouter = require("./routes/cuisine");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const isLoggedin = require("./Middleware/isLoggedin.js");
const isOwner = require("./Middleware/isOwner.js");
const app = express();
const engine = require("ejs-mate");
const ErrorHandler = require("./Errorhandler/Errorhandler");
const mongoSanitize = require("express-mongo-sanitize");
const jsonParser = bodyParser.json();
// const wrapperFn = require("./HelperFn/tryCatch");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
require("dotenv").config();
let DATABASE_URL;
const sess = {
  name: "session",
  secret: "prettyterriblesecret",
  proxy: true,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 4 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(methodOverride("_method"));

app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1); //not sure what this is

app.use(express.static(__dirname + "/public"));
app.use(jsonParser);
app.use(urlencodedParser);

app.use(session(sess));
app.use(flash());

app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function (req, res, next) {
  res.locals.state = req.isAuthenticated();
  res.locals.ownerState = req.session.owner;
  res.locals.foodCart = req.session.cart;
  res.locals.checkoutTotal = req.session.total;
  res.locals.totalQuantity = req.session.totalQty;
  res.locals.cuisineList = carouselCuisineList.carouselCuisineList;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//using res.local I can keep track of the state on the navbar partial that I use so that login option only appears when the user is not logged in and logout option appears when user is logged in
app.use("/restaurants", restaurantsRouter);
app.use("/Owner", ownerRouter);
app.use("/cuisine", cuisineRouter);
app.use(ErrorHandler);

mongoose
  .connect(
    process.env.DATABASE_URL || "mongodb://localhost:27017/MaximumMunch",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("open connection");
  })
  .catch(() => {
    console.log("error");
  });

app.get("/", function (req, res) {
  res.redirect("/home.ejs");
});

app.get("/home", async function (req, res) {
  console.log(carouselCuisineList.carouselCuisineList);
  res.render("home.ejs");
});

app.get("/index", async (req, res) => {
  const restaurants = await restaurant.find({});
  const idArray = await restaurant.find({}).select("id");
  // console.log(restaurants);
  const plainIdArray = [];
  idArray.forEach((element) => plainIdArray.push(element.id));
  var randomNumber = Math.floor(Math.random() * plainIdArray.length);
  var randomId = plainIdArray[randomNumber];
  console.log(req.session.cart);
  res.render("index.ejs", { restaurants, randomId });
});

app.get("/myRestaurantPage/:id", isLoggedin, async (req, res) => {
  if (!req.session.owner) {
    res.redirect("/login");
    console.log("not a restaurant owner account");
  }
  const findRest = await restaurant.findById(req.params.id);
  res.render("ownerShowPage.ejs", { findRest });
});

app.get("/home", async (req, res) => {
  res.render("home.ejs");
});

app.get("/login", async (req, res) => {
  req.session.views = 1;
  res.render("loginPage.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    const foundUser = await user.findOne({ username: req.body.username });
    req.session.username = req.body.username;
    if (foundUser.Owner === true) {
      req.session.owner = true;
    }
    req.flash("success", "you've logged in");
    console.log("you have logged in");
    res.redirect("/index");
  }
);

app.get("/register", async (req, res) => {
  res.render("newUser.ejs");
});
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  user.register(
    new user({ username: req.body.username }),
    password,
    function (err) {
      if (err) {
        console.log("error while user register!", err);
        return next(err);
      }
    }
  );

  console.log("user registered");
  // ----------------Need to add popup flash message------------------
  res.redirect("/index");
});

app.get("/logout", async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    console.log("You have logged out");
    res.redirect("/home");
  });
});

app.get("/foodCart/:id/addfood", isLoggedin, async (req, res) => {
  if (!req.session.total) {
    req.session.total = 0;
  }
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.totalQty) {
    req.session.totalQty = 0;
  }
  const idCheck = req.session.cart.some((element) => {
    if (element._id == req.params.id) {
      element.quantity += 1;
      req.session.totalQty += 1;
      req.session.total += element.price;
      return true;
    } else {
      return false;
    }
  });
  // if item id already exists in array return true
  if (idCheck === false) {
    const result = await food.findOne({ _id: req.params.id }).select({
      name: 1,
      _id: 1,
      price: 1,
      foodPhoto: 1,
      quantity: 1,
      Restaurant: 1,
    });
    req.session.cart.push(result);
    req.session.totalQty += 1; //increase the total quantity by 1
    req.session.total += result.price;
    req.session.cart.some((element) => {
      if (element._id == req.params.id) {
        element.quantity += 1;
      }
      console.log(req.session.cart);
    });
  }
  res.redirect("back");
  // res.send("you reached this route");
});
app.get("/foodCart/:id/removefood", isLoggedin, async (req, res) => {
  // removeFood is used for the subtraction button option
  // find if id exists in foodcart
  const idCheck = req.session.cart.some((element, index) => {
    if (req.params.id == element._id && element.quantity > 1) {
      element.quantity -= 1;
      req.session.total -= element.price;
      req.session.totalQty -= 1;
      console.log(element.quantity);
    } else if (element._id == req.params.id && element.quantity === 1) {
      req.session.total -= element.price;
      req.session.totalQty -= 1;
      req.session.cart.splice(index, 1);
    }
  });
  res.redirect("back");
});

app.get("/foodCart/:id/cartremove", isLoggedin, async (req, res) => {
  // cartRemove is for the complete removal of the item and all the quantities
  const idCheck = req.session.cart.some((element, index) => {
    if (req.params.id == element._id) {
      var removedTotal = element.quantity * element.price;
      req.session.totalQty -= element.quantity;
      req.session.total -= removedTotal;
      req.session.cart.splice(index, 1);
    }
  });
  res.redirect("back");
});

app.post("/foodCart/:id", isLoggedin, async (req, res) => {
  if (!req.session.total) {
    req.session.total = 0;
  }
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.totalQty) {
    req.session.totalQty = 0;
  }
  const idCheck = req.session.cart.some((element) => {
    if (element._id == req.params.id) {
      element.quantity += 1;
      req.session.totalQty += 1;
      req.session.total += element.price;
      return true;
    } else {
      return false;
    }
  });
  // if item id already exists in array return true
  if (idCheck === false) {
    const result = await food.findOne({ _id: req.params.id }).select({
      name: 1,
      _id: 1,
      price: 1,
      foodPhoto: 1,
      quantity: 1,
      Restaurant: 1,
    });
    req.session.cart.push(result);
    req.session.totalQty += 1;
    req.session.total += result.price;
    req.session.cart.some((element) => {
      if (element._id == req.params.id) {
        element.quantity += 1;
      }
    });
  }

  console.log(req.session.cart);
  res.status(204).send();
});

app.get("/checkout", async (req, res) => {
  res.render("checkOut.ejs");
});
app.delete("/foodCart/:id", isLoggedin, async (req, res) => {
  const selectedFood = await food.findOne({ _id: req.params.id }).select({
    name: 1,
    _id: 0,
  });
  // ***using .map to create a new array that accesses the original array's .name so that indexof can be used
  const index = req.session.cart.map((x) => x.name).indexOf(selectedFood.name);
  // const index = req.session.cart.indexOf(`${selectedFood.name}`);
  console.log(selectedFood.name);
  console.log(index);
  req.session.cart.splice(index);
  res.status(204).send();
});

app.get("/secret", isLoggedin, async (req, res, next) => {
  res.send("you have made it");
});

app.listen("3000", () => {
  console.log("Connecting to port 3000");
});

const express = require("express");
const path = require("path");
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
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const isLoggedin = require("./Middleware/isLoggedin.js");
const isOwner = require("./Middleware/isOwner.js");
const flash = require("connect-flash");
const app = express();
const engine = require("ejs-mate");
const ErrorHandler = require("./Errorhandler/Errorhandler");
const jsonParser = bodyParser.json();
// const wrapperFn = require("./HelperFn/tryCatch");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const sess = {
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
  next();
});

//using res.local I can keep track of the state on the navbar partial that I use so that login option only appears when the user is not logged in and logout option appears when user is logged in
app.use("/restaurants", restaurantsRouter);
app.use("/Owner", ownerRouter);
app.use("/cuisine", cuisineRouter);
app.use(ErrorHandler);

mongoose
  .connect("mongodb://localhost:27017/MaximumMunch", { useNewUrlParser: true })
  .then(() => {
    console.log("open connection");
  })
  .catch(() => {
    console.log("error");
  });

// function wrapperFn(fn) {
//   return function (req, res, next) {
//     try {
//       fn(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// }
// function wrapperFn(fn) {
//   {
//     return function (req, res, next) {
//       fn(req, res, next).catch((e) => next(e));
//     };
//   }

app.get("/flash", function (req, res) {
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash("info", "Flash is back!");
  res.redirect("/");
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/home", function (req, res) {
  console.log(carouselCuisineList.carouselCuisineList);
  res.render("home.ejs", { messages: req.flash("info") });
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

// app.get("/restaurants/:id", async (req, res) => {
//   const findRest = await restaurant.findById(req.params.id);
//   if (findRest.foods.length > 0) {
//     const foodList = await findRest.populate("foods");
//   }
//   res.render("userShowPage.ejs", { findRest });
// });

app.get("/myRestaurantPage/:id", isLoggedin, async (req, res) => {
  if (!req.session.owner) {
    res.redirect("/login");
    console.log("not a restaurant owner account");
  }
  const findRest = await restaurant.findById(req.params.id);
  res.render("ownerShowPage.ejs", { findRest });
});
// // app.get("/restaurants/:id/edit", async (req, res) => {
// //   const findRest = await restaurant.findById(req.params.id);
// //   res.render("editPage.ejs", { findRest });
// // });

// // app.get("/restaurants/:id/addFood", async (req, res) => {
// //   const findRest = await restaurant.findById(req.params.id);
// //   res.render("addFood.ejs", { findRest });
// // });

// app.post(
//   "/restaurants/:id/addFood",
//   wrapperFn(async (req, res, next) => {
//     const findRest = await restaurant.findById(req.params.id);
//     const newFood = req.body;
//     if (!req.body.name) {
//       throw new Error("There is no name to your food item");
//     }
//     const createFood = await food.create(newFood);
//     findRest.foods.push(createFood._id);
//     await findRest.save();
//     res.redirect(`/restaurants/${req.params.id}`);
//   })
// );

// app.post("/restaurants/:id", async (req, res) => {
//   const findRest = await restaurant.findByIdAndUpdate(req.params.id, req.body);
//   res.redirect(`/restaurants/${req.params.id}`);
// });

// app.get("/restaurants/:id/editFood/:food_id", async (req, res) => {
//   const findRest = await restaurant.findById(req.params.id);
//   const findFood = await food.findById(req.params.food_id);
//   res.render("editFood.ejs", { findFood, findRest });
// });

// app.post("/restaurants/:id/editFood/:food_id", async (req, res) => {
//   // const findRest = await restaurant.findById(req.params.id);
//   const findFood = await food.findById(req.params.food_id);
//   const newfood = req.body;
//   const updatedFood = await food.findByIdAndUpdate(findFood, newfood);
//   console.log(newfood);
//   res.send("You have reached editFood post route");
// });

// app.delete("/restaurants/:id/foods/:food_id", async (req, res) => {
//   const findRest = await restaurant.findById(req.params.id);
//   const deletedFood = await food.deleteOne({ _id: req.params.food_id });
//   const index = findRest.foods.length;
//   if (index > -1) {
//     findRest.foods.pull(req.params.food_id);
//     findRest.save();
//   }
//   console.log(deletedFood);
//   res.redirect(`/restaurants/${req.params.id}`);
// });

app.get("/home", async (req, res) => {
  res.render("home.ejs");
});

app.get("/login", async (req, res) => {
  req.session.views = 1;
  res.render("loginPage.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  async (req, res) => {
    const foundUser = await user.findOne({ username: req.body.username });
    req.session.username = req.body.username;
    if (foundUser.Owner === true) {
      req.session.owner = true;
    }
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
  // const hashPassword = await bcrypt.hash(password, saltRounds);
  // const newUser = await user.create({
  //   username: username,
  //   password: hashPassword,
  // });
  // console.log(newUser);
  console.log("user registered");
  // ----------------Need to add popup flash message------------------
  res.redirect("/index");
});

app.get("/logout", async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // req.session.owner = false;
    // req.session.username = null;
    req.session.destroy();
    console.log("You have logged out");
    res.redirect("/home");
  });
});

// app.get("/Owner/Register", async (req, res) => {
//   res.render("newOwner.ejs");
// });

// app.post("/Owner/Register", async (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   restOwner.register(
//     new restOwner({ username: req.body.username, Owner: true }),
//     password,
//     function (err) {
//       if (err) {
//         console.log("error while user register!", err);
//         return next(err);
//       }
//     }
//   );
//   console.log("owner registered");
//   res.send("new owner account created");
// });

// app.get("/Owner/Login", async (req, res) => {
//   res.render("ownerLogin.ejs");
// });

// app.post(
//   "/Owner/Login",
//   passport.authenticate("local", { failureRedirect: "/ownerLogin" }),
//   async (req, res) => {
//     const foundUser = await user.findOne({ username: req.body.username });
//     if (foundUser.Owner) {
//       req.session.owner = true;
//     }
//     console.log(foundUser);
//     console.log("you have logged in as a restaurant owner!");
//     res.redirect("/index");
//   }
// );

// ******using get route in order to fit increase and decrease quantity into one page without using multiple forms
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
  // if (idCheck === true) {
  //   req.session.cart.forEach((element, index, array) => {});
  // }

  // if (!req.session.populatedCart) {
  //   req.session.populatedCart = [];
  // }
  // for (let ids = 0; ids < req.session.cart.length; ids++) {
  //   const results = await food
  //     .find({ _id: req.session.cart[ids] })
  //     .select({ name: 1, _id: 0, price: 1 });
  //   if (!req.session.populatedCart.includes(req.session.cart[ids])) {
  //     req.session.populatedCart.push(results);
  //   }
  // }
  // console.log(req.session.populatedCart);

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

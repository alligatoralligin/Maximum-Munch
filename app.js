const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { restaurant } = require("./Schemas/restaurantSchema");
const { food } = require("./Schemas/foodSchema");
const { user, customer, restOwner } = require("./Schemas/userSchema");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const restaurantsRouter = require("./routes/restaurants");
const ownerRouter = require("./routes/owner");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const isLoggedin = require("./Middleware/isLoggedin.js");
const isOwner = require("./Middleware/isOwner.js");
const app = express();
const engine = require("ejs-mate");
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

app.use(express.static("public"));
app.use(jsonParser);
app.use(urlencodedParser);

app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use("/restaurants", restaurantsRouter);
app.use("/Owner", ownerRouter);
mongoose
  .connect("mongodb://localhost:27017/MaximumMunch", { useNewUrlParser: true })
  .then(() => {
    console.log("open connection");
  })
  .catch(() => {
    console.log("error");
  });

function wrapperFn(fn) {
  return function (req, res, next) {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
// function wrapperFn(fn) {
//   {
//     return function (req, res, next) {
//       fn(req, res, next).catch((e) => next(e));
//     };
//   }

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/home", function (req, res) {
  res.render("home.ejs");
});

app.get("/index", async (req, res) => {
  const restaurants = await restaurant.find({});
  // console.log(restaurants);
  res.render("index.ejs", { restaurants });
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
    retures.redirect("/login");
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
  res.send("new account created");
});

app.get("/logout", async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
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

app.post("/foodCart/:id", isLoggedin, async (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (req.session.cart.includes(req.params.id) === false) {
    req.session.cart.push(req.params.id);
  }
  console.log(req.session.cart);
  res.send("you have reached the post route");
});

app.get("/secret", isLoggedin, async (req, res, next) => {
  res.send("you have made it");
});

app.listen("3000", () => {
  console.log("Connecting to port 3000");
});

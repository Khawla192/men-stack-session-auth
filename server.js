require("dotenv").config();
require('./config/database');

const express = require("express");
const session = require('express-session');
const MongoStore = require("connect-mongo");

const app = express();
const methodOverride = require("method-override");
const morgan = require("morgan");

// CONTROLLER
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");
const authCtr = require("./controllers/auth.js");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

// MIDDLEWARE
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan('dev'));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
        }),
    })
);
app.use(passUserToView);
app.use(
    "/vip-lounge",
    (req, res, next) => {
        if (req.session.user) {
            res.locals.user = req.session.user; // Store user info for use in the next function
            next(); // Proceed to the next middleware or controller
        } else {
            res.redirect("/"); // Redirect unauthenticated users
        }
    },
    vipsController // The controller handling the '/vip-lounge' route
);

// PUBLIC ROUTES
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/vip-lounge", isSignedIn, (req, res) => {
    res.send(`Welcome to the party ${req.session.user.username}.`);
});

// PROTECTED ROUTES
app.use("/auth", authCtr);
app.use(isSignedIn);

// LISTENER
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
});

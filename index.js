
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));



  const trySchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});


const Item = mongoose.model("Item", trySchema);


const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.redirect("/login");
  }
}

var app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", function(req,res){
    res.render("home");
});

app.get("/secrets",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});


app.post("/login", function(req, res) {
  const email = req.body.username;
  const password = req.body.password;

  Item.findOne({email: email})
  .then(foundUser => {
    if (foundUser) {
      if (foundUser.password === password) {
        res.render("secrets", {user: email });
      } else {
        res.send("Incorrect password");
      }
    } else {
      res.send("User not found");
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).send("Error during login");
  });
});



app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new Item({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save()
     .then(() => {
      res.redirect("/login");

    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error saving user");
    });
});


app.post("/submit", function(req, res) {
  console.log(req.body);
  res.send("Data received!");
});

app.get("/submit", function(req, res) {
  res.send("This is the submit page!");
});



app.get("/logout", function(req, res) {
    res.redirect("/"); 
});





app.listen(3000,function(){
    console.log("Server started");
});

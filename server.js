require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
mongoose.set("strictQuery", true);
mongoose.connect(process.env.API_KEY, { useNewUrlParser: false });
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.post("/signup", function (req, res) {
  const user_id = req.body.username;
  const pass = req.body.password;
  const id = req.body.admin;
  const name = req.body.name;

  User.register(
    { username: user_id, name: name},
    pass,
    function (err, user) {
      if (err) {
        res.send(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        });
      }
    }
  );
});
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      res.send(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});
app.get("/user", function (request, response) {
  if (request.isAuthenticated()){
    res.send("this is home page");
  } else {
    response.send("user is not logged in");
  }
});
app.post('/changepass',function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  
  });
  const newpass=req.body.newpass;
  
  req.login(user, function (err) {
    if (err) {
      res.send(err);
    } else {
      User.register(
        { username: req.body.username},
        newpass,
        function (err, user) {
          if (err) {
            res.send(err);
          } else {
            passport.authenticate("local")(req, res, function () {
              res.send("Password changed");
            });
          }
        }
      );
      User.findOneAndRemove({ username: req.body.username }, function (err) {
        if(err){
          console.log(err);
        }
      });
    }
  });
});
app.get('/updatedetails',function(req,res){
  const ui=req.body.username;
  const n=req.body.name;
  if(req.isAuthenticated()){
    User.findOneAndUpdate({username:ui},{name:n},function(err){
      if(err){
        res.send(err);
      }
      else{
        res.send("Updated")
      }
    })
  }
})
app.listen(process.env.PORT || 3000, function () {
  console.log("304");
});


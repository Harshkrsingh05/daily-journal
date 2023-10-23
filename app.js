const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');




const app = express();
require('./config/passport')(passport);
const db = process.env.mongoURI;
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


// app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use("/public",express.static('public'));
app.use(express.static(__dirname + '/public'));

app.use(
  session({
    secret: process.env.secretOrKey,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

// mongoose.connect(process.env.MongoDB_URL);




app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
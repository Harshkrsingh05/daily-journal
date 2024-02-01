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
const cors = require('cors');


const app = express();
app.use(cors());

// app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use("/public",express.static('public'));
app.use(express.static(__dirname + '/public'));


app.use(
  session({
    secret: process.env.secretOrKey,
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: 'None',
      secure: true,
    },
  })
);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  
const db = process.env.mongoURI;
mongoose.connect(
  db,
  { useNewUrlParser: true ,useUnifiedTopology: true}
)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

require('./config/passport')(passport);

// Google OAuth2 routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'consent' })
);


app.get('/auth/google/callback',
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Error during Google authentication:', err);
      return res.redirect('/users/login'); // Redirect to login page on error
    }

    if (!user) {
      console.error('Google authentication failed. User not found.');
      return res.redirect('/users/login'); // Redirect to login page if user not found
    }

    // Handle successful authentication
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Error during login:', loginErr);
        return res.redirect('/users/login'); // Redirect to login page on login error
      }

      console.log('Google authentication successful:', user);
      return res.redirect('/'); // Redirect to dashboard or desired route on success
    });
  })
);

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
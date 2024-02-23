const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Blog = require('../models/Blog');
const Global=require('../models/Global');
const User=require('../models/User');
const passport = require('passport');

//User route

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome',{user:req.user}));
// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
// Local login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true 
}));


// Google authentication
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureFlash: true  }),
  (req, res) => {
    res.redirect('/home');
  }
);
// // Dashboard
// router.get('/home', ensureAuthenticated, (req, res) =>
//   res.render('home', {
//     user: req.user
//   })
// );

// Registration Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Process Registration
router.post('/register', async (req, res) => {
  try {
    const { displayName, email, password  } = req.body;
    const user = new User({ displayName,email, password });
    await user.save();
    res.redirect('/home');
    // if (user) {
    //   // User already exists, handle accordingly (e.g., display error message)
    //   req.flash('error_msg', 'Email already registered');
    //   res.redirect('/register');
    // } else {
    //   // Create new user
    //   const newUser = new User({ email, password, displayName });
    //   await newUser.save();
    //   req.flash('success_msg', 'You are now registered and can log in');
    //   res.redirect('/login');
    // }
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});




// Welcome Page


const StartingContent = " Are you ready to embark on a journey of self-discovery, personal growth, and reflection? Welcome to Your Daily Journal, your trusted companion on the path to a more mindful and purposeful life.Journaling has been a cherished practice for centuries, embraced by thinkers, writers, and individuals seeking to understand themselves better. It's a powerful tool that allows you to:  Reflect on your thoughts and emotions,Set and track personal goals,Express gratitude and positivity,Document life's memorable moments,Solve problems and overcome challenges,Discover patterns and insights.<strong>Enough reading now make your first blog by clicking on Compose in the navbar.</strong>";
const djListSchema = new mongoose.Schema({
  name: String
});
const djList =mongoose.model("djList",djListSchema);

const djList1=new djList ({
  name: StartingContent
});
const defaultdjLists=djList1;
 
let posts=[];
//

router.get("/home",ensureAuthenticated, async function(req, res){
  const isLoggedIn = req.isAuthenticated();
    try {
    const foundBlogs = await Blog.find({user: req.user.id}).exec();
    const api_url = "https://type.fit/api/quotes";
    if (isLoggedIn ) {
      fetch(api_url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // Assuming data is an array of quotes
        const randomQuote = data[Math.floor(Math.random() * data.length)];

      res.render("home", { StartingContent: StartingContent, posts: posts,blogs: foundBlogs,user:req.user,isLoggedIn: isLoggedIn,randomQuote: randomQuote  });
      
    })
  }

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/about",ensureAuthenticated, function(req, res){

  res.render("about");
});

router.get("/contact",ensureAuthenticated, function(req, res){
  res.render("contact");
});

router.get("/compose",ensureAuthenticated, function(req, res){
  res.render("compose");
});
router.get('/global',async (req, res) => {
  try {
    const foundGlobalBlogs = await Global.find({}).populate('user', 'displayName');
    const api_url = "https://type.fit/api/quotes";
      fetch(api_url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
     res.render("global", {posts: posts,blogs: foundGlobalBlogs,randomQuote: randomQuote  });
    })
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async function (req, res) {
  const titleName = req.body.userinputTitle;
  const postName = req.body.userinputPost;
  const user=req.user.id;
  const newBlog = new Blog({
    title: titleName,
    post: postName,
    user: user
  });
  let postPublish ={
    title: req.body.userinputTitle,
    content: req.body.userinputPost
  } ;
  posts.push(postPublish);
  try {
    await newBlog.save();
    console.log("Successfully saved user input to DB.");
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/compose");
  }
});

router.post('/global', async (req, res) => {
  const titleName = req.body.userinputTitle;
  const postName = req.body.userinputPost;
  const user = req.user.id;

  // Create a new global post
  const newGlobalPost = new Global({
    title: titleName,
    post: postName,
    user: user,
  });

  try {
    await newGlobalPost.save();
    console.log('Successfully saved user input as a global post.');
    res.redirect('/global'); // Redirect to the global page or any other appropriate page
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/global/:postname', async (req, res) => {
  try {
    const postName = req.params.postname;

    // Fetch the specific global post from the database based on the title
    const foundGlobalPost = await Global.findOne({ title: postName }).populate('user').exec();

    if (foundGlobalPost) {
      res.render('global-post', {
        title: foundGlobalPost.title,
        content: foundGlobalPost.post,
        author: foundGlobalPost.user[0].displayName, // Assuming user has a 'name' property
        timestamp: foundGlobalPost.timestamp,
      });
    } else {
      // Handle the case where the global post with the specified title was not found
      res.status(404).send('Global post not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/posts/:postName/:postId", async function (req, res) {
  try {
    const postName = req.params.postName;
    const postId = req.params.postId;
    // Fetch the specific blog post from the database based on the title
    const foundBlog = await Blog.findOne({ title: postName, _id:postId}).exec();

    if (foundBlog) {
      if(req.user && req.user.id === foundBlog.user.toString()){
        res.render("post", {
          title: foundBlog.title,
          content: foundBlog.post,
          user: req.user,
          post: foundBlog 
        });
      }
      else{
        res.status(403).send('You do not have permission to access this blog.')
      }
    } else {
      // Handle the case where the blog post with the specified title was not found
      res.status(404).send("Blog post not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
// Add this route to handle the delete request
router.post("/delete/:postId", async function (req, res) {
  try {
    const postId = req.params.postId;

    // Delete the blog post from the database based on the postId
    await Blog.findByIdAndRemove(postId).exec();

    // Redirect back to the home page after deletion
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
    req.flash('success_msg', 'You are logged out');
  });
});


module.exports = router;

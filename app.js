const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config(); 

const homeStartingContent = " Are you ready to embark on a journey of self-discovery, personal growth, and reflection? Welcome to Your Daily Journal, your trusted companion on the path to a more mindful and purposeful life.Journaling has been a cherished practice for centuries, embraced by thinkers, writers, and individuals seeking to understand themselves better. It's a powerful tool that allows you to:  Reflect on your thoughts and emotions,Set and track personal goals,Express gratitude and positivity,Document life's memorable moments,Solve problems and overcome challenges,Discover patterns and insights";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

mongoose.connect(process.env.MongoDB_URL);

const djListSchema = new mongoose.Schema({
  name: String
});
const djList =mongoose.model("djList",djListSchema);

const blogSchema = new mongoose.Schema({
  title: String,
  post: String
});
const Blog = mongoose.model("Blog", blogSchema);


const djList1=new djList ({
  name: homeStartingContent
});
const defaultdjLists=djList1;
 
let posts=[];


app.get("/", async function(req, res){
  try {
    const founddjLists = await djList.find({}).exec();
    const foundBlogs = await Blog.find({}).exec();
    
    if (founddjLists.length === 0 || foundBlogs.length===0) {
      await djList.insertMany(defaultdjLists);
      console.log("Successfully saved default djLists to DB.");
      const newBlog = new Blog({
        title: "Sample Title",
        post: "Sample Post"
      })
      await newBlog.save();
      console.log("Successfully saved a sample blog to DB.");
      res.redirect("/");
    } else {
      res.render("home", { StartingContent: homeStartingContent, posts: posts,blogs: foundBlogs  });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/about", function(req, res){

  res.render("about",{abContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact",{conContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/", async function (req, res) {
  const titleName = req.body.userinputTitle;
  const postName = req.body.userinputPost;
  const newBlog = new Blog({
    title: titleName,
    post: postName
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


app.get("/posts/:postName", async function (req, res) {
  try {
    const postName = req.params.postName;
    // Fetch the specific blog post from the database based on the title
    const foundBlog = await Blog.findOne({ title: postName }).exec();

    if (foundBlog) {
      res.render("post", {
        title: foundBlog.title,
        content: foundBlog.post
      });
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
app.post("/delete/:postId", async function (req, res) {
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


app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
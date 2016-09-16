'use strict'

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded());

//To specify that we will be using EJS templates, add the following line after defining your app variable
app.set("view engine", "ejs");

let generateRandomString = (str) => {
  let num = Math.random().toString(36).substr(2, 5);
  return num;
}
let collection = null;
let database = null;


// MONGO /////
MongoClient.connect(MONGODB_URI, (err,db) => {
  if (err) {
    // console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }
  database = db;
  collection = db.collection("urls");
});


let retrieveLong = function(shortURL, rendercb){
  collection.find({shortURL: shortURL},{longURL: 1}).toArray((err, results) => {
    database.close();
    let shortLong = {
      shortURL: shortURL,
      longURL: results[0].longURL
    };
    rendercb(shortLong)
  });
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  console.log(shortURL);
  retrieveLong(shortURL, (shortLong) => {
    res.render("urls_show", shortLong)
  })
  // res.end("Hello!");
});







app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});






//delete
app.delete("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//posts
app.post("/urls", (req, res) => {  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//puts
app.put("/urls/:id", (req, res) => {
  let longURL = req.body.URLtoSubmit
  let shortURL = req.params.id
  urlDatabase[shortURL] = longURL
  // console.log(longURL, shortURL, urlDatabase[shortURL]);
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

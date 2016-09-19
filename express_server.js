require('dotenv').config()
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var bodyParser = require("body-parser");
var methodOverride = require('method-override');
var MongoClient = require("mongodb").MongoClient;
// var MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";
var MONGODB_URI = process.env.MONGODB_URI;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded());
app.set("view engine", "ejs");

var generateRandomString = (str) => {
  var num = Math.random().toString(36).substr(2, 5);
  return num;
}

//connect to database
var collection
MongoClient.connect(MONGODB_URI, (err,db) => {
  var database = db;
  collection = db.collection("urls");
})


app.get("/", (req, res) => {
  res.redirect("/urls/new");
});

app.get("/urls", (req, res) => {
  collection.find().toArray((err, results) =>{
  var resultingObj = {}
  for (var object of results){
    resultingObj[object.shortURL] = object.longURL
  }
    var index = {urls: resultingObj};
    res.render("urls_index", index);
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id
  collection.findOne({shortURL:shortURL}, (err, results) =>{
    if (!results) {
      res.render("no_short")
    } else {
    var resultingObj = results
    var templateVars = { urls: resultingObj }
    res.render("urls_show", resultingObj);
    }
  })
})

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL
  collection.findOne({shortURL:shortURL}, (err, results) =>{
    if (results == null) {
      res.render("no_short")
    } else {
      var longURL = results.longURL
      if (longURL.match('http')){
        res.redirect(longURL);
      } else {
      res.redirect(`http://${longURL}`);
      }
    }
  })
})

//delete
app.delete("/urls/:id", (req, res) => {
  var shortURL = req.params.id
  collection.remove({shortURL:shortURL})
  collection.find().toArray((err, results) =>{
    var resultingObj = {}
    for (var object of results){
      resultingObj[object.shortURL] = object.longURL
    }
    var templateVars = { urls: resultingObj }
    res.render("urls_index", templateVars);
  });
});

//posts
app.post("/urls", (req, res) => {  // debug statement to see POST parameters // call random generate function
  var shortURL = generateRandomString()
  var longURL = req.body.URLtoSubmit
    collection.insert({shortURL: shortURL, longURL: longURL})
    collection.find().toArray((err, results) =>{
      var resultingObj = {}
      for (var object of results){
        resultingObj[object.shortURL] = object.longURL
      }
      var redirectPath = `/urls/${shortURL}`
      res.redirect(redirectPath);
    })
})

//puts
app.put("/urls/:id", (req, res) => {
  var longURL = req.body.URLtoSubmit
  var shortURL = req.params.id
  collection.update({shortURL: shortURL}, {shortURL: shortURL, longURL: longURL})
  collection.find().toArray((err, results) =>{
    var resultingObj = {}
    for (var object of results){
      resultingObj[object.shortURL] = object.longURL
    }
      var index = {urls: resultingObj};
      res.render("urls_index", index);
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

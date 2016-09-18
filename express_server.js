

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var bodyParser = require("body-parser");
var methodOverride = require('method-override');
var MongoClient = require("mongodb").MongoClient;
var MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";



app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded());

app.set("view engine", "ejs");

var generateRandomString = (str) => {
  var num = Math.random().toString(36).substr(2, 5);
  return num;
}

var retrieveLong = require("./retrieveLong.js")

// var urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

app.get("/", (req, res) => {
  res.redirect("/urls/new");
});

app.get("/urls", (req, res) => {
  MongoClient.connect(MONGODB_URI, (err,db) => {
  var database = db;
  var collection = db.collection("urls");

  collection.find().toArray((err, results) =>{
    var resultingObj = {}
    for (var object of results){
      resultingObj[object.shortURL] = object.longURL
    }
      var index = {urls: resultingObj};
      res.render("urls_index", index);
    });
  })
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
var shortURL = req.params.id
  MongoClient.connect(MONGODB_URI, (err,db) => {
    var database = db;
    var collection = db.collection("urls");
    collection.find({shortURL:shortURL}).toArray((err, results) =>{
      if (! results[0]) {
        res.render("no_short")
      }
      var resultingObj = results[0]
        var templateVars = { urls: resultingObj }
      res.render("urls_show", resultingObj);
    })
  })
})

app.get("/u/:shortURL", (req, res) => {
  MongoClient.connect(MONGODB_URI, (err,db) => {
    var database = db;
    var collection = db.collection("urls");
    collection.find({shortURL:shortURL}).toArray((err, results) =>{
      var resultingObj = results[0]

          // var templateVars = { urls: resultingObj }

    var longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
    })
  })
})


//delete
app.delete("/urls/:id", (req, res) => {
  var shortURL = req.params.id
  MongoClient.connect(MONGODB_URI, (err,db) => {
    var database = db;
    var collection = db.collection("urls");
    collection.remove({shortURL:shortURL})
    collection.find().toArray((err, results) =>{
      var resultingObj = {}
      for (var object of results){
        resultingObj[object.shortURL] = object.longURL
      }
        var templateVars = { urls: resultingObj }
      res.render("urls_index", templateVars);
    });
  })
});

//posts
app.post("/urls", (req, res) => {  // debug statement to see POST parameters // call random generate function
  var shortURL = generateRandomString()
  var longURL = req.body.URLtoSubmit
  console.log(longURL);
  MongoClient.connect(MONGODB_URI, (err,db) => {
    var database = db;
    var collection = db.collection("urls");
    collection.insert({shortURL: shortURL, longURL: longURL})
    collection.find().toArray((err, results) =>{
      console.log(results)
    var resultingObj = {}
    for (var object of results){
      resultingObj[object.shortURL] = object.longURL
    }
      var redirectPath = `/urls/${shortURL}`
      // var index = {urls: resultingObj};
      res.redirect(redirectPath);
    })
  })
})

//puts
app.put("/urls/:id", (req, res) => {
  var longURL = req.body.URLtoSubmit
  var shortURL = req.params.id
  MongoClient.connect(MONGODB_URI, (err,db) => {
    var database = db;
    var collection = db.collection("urls");
    collection.update({shortURL: shortURL}, {shortURL: shortURL, longURL: longURL})
    collection.find().toArray((err, results) =>{

      var resultingObj = {}
      for (var object of results){
        resultingObj[object.shortURL] = object.longURL
      }
        var index = {urls: resultingObj};
        res.render("urls_index", index);
      // res.end('Hello')
    });
  })
  // urlDatabase[shortURL] = longURL
  // console.log(longURL, shortURL, urlDatabase[shortURL]);
  // res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

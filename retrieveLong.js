'use strict'

const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";
const MongoClient = require("mongodb").MongoClient;
let collection = null;
let database = null;

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

module.exports = {
  retrieve: retrieveLong
}

"use strict"

const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

let shortURL = 'b2xVn2'

let retrieveLong = function(shortURL, callbackRENDER){
  // console.log('Connecting to MongoDB running at: ${MONGODB_URI}');

  MongoClient.connect(MONGODB_URI, (err,db) => {
    if (err) {
      // console.log('Could not connect! Unexpected error. Details below.');
      throw err;
    }

    let urls = db.collection("urls");
    // console.log('Connected to the database!');

    // console.log('Retreiving documents for the "test" collection...');
    urls.find({shortURL: shortURL},{longURL: 1}).toArray((err, results) => {
      // console.log('results: ', results);
      // console.log('Disconnecting from Mongo!');
    db.close();
      let shortLong = {
        shortURL: shortURL,
        longURL: results[0].longURL
      };
      callbackRENDER("urls_show", shortLong)

    });
  });
}

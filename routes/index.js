'use strict';
var express = require('express');
var router = express.Router();
// var tweetBank = require('../tweetBank');
var client = require('../db/');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id', function(err, result) {
      if (err) return next(err);
      var tweets = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweets,
        showForm: true
      });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    // var tweetsForName = tweetBank.find({ name: req.params.username });
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE name = \'' + req.params.username + '\';', function(err, result) {
      if (err) return next(err);
      var tweets = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweets,
        showForm: true
      });
    });
});
  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT * FROM tweets WHERE id = ' + req.params.id + ';', function(err, result) {
      if (err) return next(err);
      var tweets = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweets,
        showForm: true
      });
  });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var nameExists = 0;
    var userId;
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE name = \'' + req.body.name + '\';', function(err, result) {
      if (err) return next(err);
      if (result.rowCount > 0) {
        nameExists = 1;

        userId = result.rows[0].userid;
      }
    });
    if (!nameExists) {
      //insert into name
      client.query('INSERT INTO users (id, name, pictureurl) VALUES (DEFAULT, \'' + req.body.name + '\', DEFAULT) RETURNING id;', function(err, result) {if (err) return next(err);
              console.log(result);
        userId = result.rows[0].id;})

    }
    //insert into tweets

    client.query('INSERT INTO tweets (id, userid, content) VALUES ($1, $2, $3) RETURNING id;', ['DEFAULT', userId, '\'' + req.body.content + '\''], function(err, result) {if (err) return next(err);
    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    //io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });
})

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}

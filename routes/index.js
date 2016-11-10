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
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE tweets.id = ' + req.params.id + ';', function(err, result) {
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
    var nameExists = false;
    var UI;
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE name = \'' + req.body.name + '\';', function(err, result) {
      if (err) return next(err);
      console.log(result.rowCount);
      if (result.rowCount > 0) {
        nameExists = true;
        UI = result.rows[0].id;
        client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2) RETURNING id;', [UI, req.body.content], function(err, result) {
          if (err) return next(err);
        });
      } else {
        client.query('INSERT INTO users (id, name, pictureurl) VALUES (DEFAULT, \'' + req.body.name + '\', DEFAULT) RETURNING id;', function(err, result) {
          if (err) return next(err);
          UI = result.rows[0].id;
          client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2) RETURNING id;', [UI, req.body.content], function(err, result) {if (err) return next(err);});
      })}
    });
    res.redirect('/');
  });
  return router;
};

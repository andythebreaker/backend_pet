var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var empty = require('is-empty');
var Isemail = require('isemail');
var isEqual = require('is-equal');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//import Data Model
var User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//加入register routing
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

//加入login routing
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
});

//POST request to register
router.post('/register', upload.single('profileimage'), function (req, res, next) {
  //using multer
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  console.log(name);
  console.log(email);
  console.log(username);
  console.log(password);
  console.log(password2);
  console.log(isEqual(password, password2));
  var error_msg_res = {};

  //Form Validator
  if (empty(name)) {
    error_msg_res["name"] = "empty";
  }
  if (!Isemail.validate(email)) {
    error_msg_res["email"] = "UNvalidate";
  }
  if (empty(username)) {
    error_msg_res["username"] = "empty";
  }
  if (empty(password)) {
    error_msg_res["password"] = "empty";
  }
  if (!isEqual(password, password2)) {
    error_msg_res["password2"] = "neq";
  }

  //console.log(req.file); //show uploaded image info.
  if (req.file) {
    console.log('Uploading File...');
    var profileimage = req.file.filename;
  } else {
    console.log('No File Uploaded...');
    var profileimage = 'noimage.jpg'; //use default image
    error_msg_res["profileimage"] = "empty";
  }

  console.log(error_msg_res);
  if (!empty(error_msg_res)) {
    //res.status(400).json(error_msg_res);
    res.render('register', {
      errors: error_msg_res
    });
  } else {
    //res.status(200).json(error_msg_res);
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser, function (err, user) {
      //track for error
      if (err) throw err;
      console.log(user);
    });
    //Show success message with flash
    req.flash('success', 'You are now registered and can login');
    res.location('/');
    res.redirect('/');
  }

});

passport.use(new LocalStrategy(function(username, password, done){
  //compare username
  User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
          return done(null, false, {message: 'Unknown User'});
      }
      //compare password
      User.comparePassword(password, user.password, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
              return done(null, user);
          } else {
              return done(null, false, {message: 'Invalid Password'});
          }
      });

  });
}));

//加入 passport 驗證
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
//繼續加入 session
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//加入login的HTTP POST request
//POST request to login
router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
      req.flash('success', 'You are now logged in');
      res.redirect('/');
  });

module.exports = router;
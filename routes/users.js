var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var empty = require('is-empty');
var Isemail = require('isemail');
var isEqual = require('is-equal');

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
    res.status(400).json(error_msg_res);
  } else {
    res.status(200).json(error_msg_res);
  }

});

module.exports = router;
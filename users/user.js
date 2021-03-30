var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/membres', function(req, res, next) {
  res.send('respond with a resource');
});

//加入register routing
router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

//加入login routing
router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

module.exports = router;
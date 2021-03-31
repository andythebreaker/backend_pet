var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res, next) {
  //console.log("router.get(__/__, ensureAuthenticated, function(req, res, next) {");
  res.render('index', { title: 'Members' });
  //res.status(200).json({"exampleKey":"exampleValue"});
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
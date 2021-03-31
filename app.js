/*
註：
這裡要用 npm start，不能像前面的project一樣用 node app.js
因為啟動server的code是存在bin\www檔案中，而非app.js
*/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bcrypt = require('bcryptjs');

//---
var bodyParser = require('body-parser');
//add new module
var session = require('express-session');
var passport = require('passport');
//var expressValidator = require('express-validator');
const { body, validationResult } = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var upload = multer({ dest: './uploads' }); // setup multer upload destination
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
//create db connection using mongoose
var db = mongoose.connection;
//---

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//---
// Handle Sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
// Passport
app.use(passport.initialize());
app.use(passport.session());
// validator
/*app.use(legacy({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));*///驗證器
app.post(
  '/user',
  // username must be an email
  body('username').isEmail(),
  // password must be at least 5 chars long
  body('password').isLength({ min: 5 }),
  (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    User.create({
      username: req.body.username,
      password: req.body.password,
    }).then(user => res.json(user));
  },
  //https://github.com/express-validator/express-validator/issues/735
  //https://express-validator.github.io/docs/
);
// messages (express-messages / connect-flash)
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
//---

//set global variable for login/logout status
app.get('*', function(req, res, next){
  console.log("app.get(*, function(req, res, next){");
  console.log(req.user);
  res.locals.user = req.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

/*ref
https://ithelp.ithome.com.tw/articles/10189263
*/
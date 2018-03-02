var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var login = require('./routes/login');
var toys = require('./routes/toys');
var toyDetail = require('./routes/toyDetail');
var box = require('./routes/box');
var uploadToy = require('./routes/uploadToy');
var mine = require('./routes/mine');
var records = require('./routes/records');
var reset = require('./routes/reset');
var register = require('./routes/register');
var publicService = require('./routes/public');
var forget = require('./routes/forget');
var review = require('./routes/review');
var about = require('./routes/about');
var wechat = require('./routes/wechat');
var ims = require('./routes/ims');
var questions = require('./routes/questions');
var finish = require('./routes/finish');
var adminLogin = require('./routes/adminLogin');
var adminToys = require('./routes/adminToys');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var models = require('./models');
var SequelizeStore = require('connect-session-sequelize')(session.Store);

app.use(session({
    secret: 'exchange',
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
        db: models.sequelize,
        checkExpirationInterval: 10*60*1000,
        expiration: 24*60*60*1000
    })
}));

app.use('/', index);
app.use('/index', index);
app.use('/login', login);
app.use('/toys', toys);
app.use('/toyDetail', toyDetail);
app.use('/box', box);
app.use('/uploadToy', uploadToy);
app.use('/mine', mine);
app.use('/records', records);
app.use('/reset', reset);
app.use('/register', register);
app.use('/public', publicService);
app.use('/forget', forget);
app.use('/review', review);
app.use('/about', about);
app.use('/wechat', wechat);
app.use('/ims', ims);
app.use('/questions', questions);
app.use('/finish', finish);
app.use('/adminLogin', adminLogin);
app.use('/adminToys', adminToys);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
//const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const PassportLocal = require('passport-local').Strategy;


const passport = require('passport');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use(express.urlencoded({ extended: true }));

// settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser('geoloc'));
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/common', express.static('routes'));

app.use('/', index);
app.use('/users', users);

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
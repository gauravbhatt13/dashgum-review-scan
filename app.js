var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var scanRouter = require('./routes/amazonScan');
var flipkartRouter = require('./routes/flipkartScan');

var app = express();

app.use(bodyParser.json({type: 'application/*+json'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/scan', scanRouter);
app.use('/flipkartScan', flipkartRouter);
app.use('/users', usersRouter);

module.exports = app;

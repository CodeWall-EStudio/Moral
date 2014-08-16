var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');
var session = require('express-session');
var app = express();

// config setup
var config = require('./config/' + app.get('env') + '.js');
var CONSTANTS = require('./config/constants.js');
CONSTANTS.ENV = app.get('env');

if (CONSTANTS.ENV !== 'development') {
    app.enable('trust proxy');
}

// console.log(config.DB);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(multer({ dest: './upload/'}));
app.use(cookieParser());
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
//app.use(require('less-middleware')(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(require('less-middleware')(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'src')));


// 初始化路由处理
// 处理老师请求
var teacher = require('./routes/teacher_route');
var routerTeacher = express.Router();
routerTeacher.all('*', teacher);
app.use('/teacher', routerTeacher);

// 初始化路由处理
// 处理学生请求
var student = require('./routes/student_route');
var routerStudent = express.Router();
routerStudent.all('*', student);
app.use('/student', routerStudent);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

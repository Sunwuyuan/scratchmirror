var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
var app = express();

var corslist=["localhost","zerocat.houlangs.com","zerocat.wuyuan.dev","z.8r.ink",'zerocat-static.houlangs.com','zerocat-comment.houlangs.com','zerocatdev.github.io','zeronext.wuyuan.dev','python.190823.xyz','scratch.190823.xyz',"zerocat-test1.wuyuan.dev","scratch-editor.192325.xyz"]

// cors配置
var cors = require("cors");
var corsOptions = {
  origin: (origin, callback) => {
    if (!origin || corslist.indexOf(new URL(origin).hostname) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions)); // 应用CORS配置函数
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectsRouter = require('./routes/projects');
var thumbnailsRouter = require('./routes/thumbnails');
var avatarsRouter = require('./routes/avatars');
var studiosRouter = require('./routes/studios');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/thumbnails', thumbnailsRouter);
app.use('/avatars', avatarsRouter);
app.use('/studios', studiosRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

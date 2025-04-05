import dotenv from 'dotenv';
dotenv.config();
import './instrumentation.js';

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
const app = express();

var corslist=["localhost","zerocat.houlangs.com","zerocat.wuyuan.dev","z.8r.ink",'zerocatdev.github.io','zeronext.wuyuan.dev','scratch.190823.xyz',"scratch-editor.192325.xyz"]

// cors配置
import cors from "cors";
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
app.set("views", process.cwd() + "/views");
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import projectsRouter from './routes/projects.js';
import thumbnailsRouter from './routes/thumbnails.js';
import avatarsRouter from './routes/avatars.js';
import studiosRouter from './routes/studios.js';
import proxyRouter from './routes/proxy.js';
import asdmRouter from './routes/asdm.js';
import newsRouter from './routes/news.js';

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/thumbnails', thumbnailsRouter);
app.use('/avatars', avatarsRouter);
app.use('/studios', studiosRouter);
app.use('/proxy', proxyRouter);
app.use('/asdm', asdmRouter);
app.use('/news', newsRouter);
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

export default app;

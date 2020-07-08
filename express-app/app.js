const express = require("express"),
  
  path = require("path"),
  //favicon = require('serve-favicon'),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  routes = require("./routes"),
  app = express();

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist/umd/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/bootstrap-colorpicker', express.static(__dirname + '/node_modules/bootstrap-colorpicker/dist/'));
app.use('/bootswatch', express.static(__dirname + '/node_modules/bootswatch/dist/minty/'));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css/'));
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts/'));


app.use('/assets', express.static(__dirname + '/../guis/'));


app.use("/", routes);

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
  res.render('error', {title: "Error"});
});

module.exports = app;

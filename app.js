var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var catalogRouter = require("./routes/catalog");

var app = express();

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const dev_db_url =
  "mongodb+srv://test:test1234@cluster1.cqcqntt.mongodb.net/LocalLibrary?retryWrites=true&w=majority";
const uri = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(uri);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Apply rate limiter to all requests
app.use(limiter);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
app.use(compression());
app.use(
  session({
    secret: "1234", // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/catalog", catalogRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

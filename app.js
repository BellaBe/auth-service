const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("errorhandler");

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//configure isProduction variable
const isProduction = process.env.NODE_ENV === "production";

//Initiate app
const app = express();



//Configure app

app.use(cors());
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret: "passport-tutorial", cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false}));

if(!isProduction){
  app.use(errorHandler());
}

//Configure mongoose
mongoose.connect("mongodb://bellabe:Bell5221@ds137008.mlab.com:37008/user_auth");
mongoose.set("debug", true);

//Models & routes
require("./models/User");
require("./config/passport");
app.use(require('./routes'));

if(!isProduction){
  app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.json({
      errors:{
        message: err.message,
        error: err,
      }
    });
  });
}

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

app.listen(8000, ()=>{
  "Server is listening on port 8000";
});

// Exprires: Date.now()
// Cache-Control: {
//   max-age: 3600 (1h) || max-age: 0,
// }
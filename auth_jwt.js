var passport = require("passport");
const User = require("./users");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt_decode = require("jwt-decode");
// db = require("./db")();
require("dotenv").config();

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.SECRET_KEY;

var currentToken = "";

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    User.findById(jwt_payload.id, function (err, user) {
      currentToken = user;
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  })
);

exports.token = currentToken;
exports.isAuthenticated = passport.authenticate("jwt", { session: false });
exports.secret = opts.secretOrKey;

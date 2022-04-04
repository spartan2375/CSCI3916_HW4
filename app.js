var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var authController = require("./auth");
var jwtController = require("./auth_jwt");
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt_decode = require("jwt-decode");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var exp = require("constants");
var User = require("./users");
var Movie = require("./movies");
var Review = require("./reviews");
const { title } = require("process");

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

var router = express.Router();

var port = process.env.PORT || 8080;
var uniq = process.env.UNIQUE_KEY;

function getJSONObject(req, msg) {
  var json = {
    headers: "No headers",
    key: process.env.UNIQUE_KEY,
    body: "No body",
    message: msg,
  };

  if (req.headers != null) json.headers = req.headers;
  if (req.body != null) json.body = req.body;
  return json;
}

// var review = new Review();
// review.title = "The Lego Movie";
// review.name = "Bob Jones";
// review.comment = "meh";
// review.rating = 3;
// review.save();

router
  .route("/reviews")
  .get(function (req, res) {
    Review.find()
      .lean()
      .exec(function (err, review) {
        res.type;
        return res.json(review);
      });
  })
  .post(jwtController.isAuthenticated, function (req, res) {
    //title, name, comment, rating
    if (!req.body.title || !req.body.rating) {
      res.json({
        success: false,
        msg: "title and rating required (comment is optional)",
      });
      // user is dumb
    } else {
      var review = new Review();
      review.title = req.body.title;
      review.userID = jwt_decode(req.headers.authorization)["id"];
      if (req.body.comment) review.comment = req.body.comment;
      review.rating = req.body.rating;

      review.save();
      res.json({ success: true, msg: "Review saved!" });
    }
  })
  .delete(jwtController.isAuthenticated, function (req, res) {
    if (!req.body.title || !req.body.name) {
      res.json({
        success: false,
        msg: "movie title must be in body",
      });
    } else {
      Review.findOneAndDelete({
        title: req.body.title,
        userID: jwt_decode(req.headers.authorization)["id"],
      }).exec(function (err, review) {
        if (err) {
          console.log(err);
          res.json(err).send();
        } else
          res.json({
            success: true,
            msg: "deleted review",
          });
      });
    }
  });

router
  .route("/movies/:title")
  .get(jwtController.isAuthenticated, function (req, res) {
    if (req.query.reviews == "true") {
      Movie.aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "title",
            foreignField: "title",
            as: "aggregatedReviews",
          },
        },
        { $match: { title: req.params.title } },
      ]).exec(function (err, movie_reviews) {
        if (err) res.send(err);
        res.json(movie_reviews);
      });
    } else {
      Movie.findOne({ title: req.params.title }).exec(function (err, movie) {
        if (err) {
          res.send(err);
        } else {
          try {
            res.json({
              success: true,
              id: movie.id,
              title: movie.title,
              year: movie.year,
              genre: movie.genre,
              actors: movie.actors,
            });
          } catch (e) {
            res.json({
              success: false,
              msg: "Movie not found!",
            });
          }
        }
      });
    }
  });

router
  .route("/movies")
  .get(jwtController.isAuthenticated, function (req, res) {
    //.body.title) {
    Movie.find()
      .lean()
      .exec(function (err, movies) {
        res.type;
        return res.json(movies);
      });
  })

  .post(jwtController.isAuthenticated, function (req, res) {
    if (!req.body.title || !req.body.year || !req.body.genre) {
      res.json({
        success: false,
        msg: "Please include a title, year, and genre!",
      });
    } else if (
      ![
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Horror",
        "Mystery",
        "Thriller",
        "Western",
      ].includes(req.body.genre)
    ) {
      res.json({
        success: false,
        msg: "Genre must be on of the following: Action, Adventure, Comedy, Drama, Fantasy, Horror, Mystery, Thriller, or Western!",
      });
    } else if (req.body.actors.length < 3) {
      res.json({
        success: false,
        msg: "Request must include at least three actors and their characters",
      });
    } else {
      var movie = new Movie();
      movie.title = req.body.title;
      movie.year = req.body.year;
      movie.genre = req.body.genre;
      movie.actors = req.body.actors;
      console.log(req.body);
      movie.save();
      res.json({
        success: true,
        msg: `Successfully added ${movie.title} to the collection!`,
      });
    }
  })

  .put(jwtController.isAuthenticated, function (req, res) {
    if (!req.body.title)
      res.json({
        success: false,
        msg: "Title required for update call!",
      });
    else {
      Movie.findOne({ title: req.body.title }).exec(function (err, movie) {
        if (err) {
          res.send(err);
        } else {
          movie.title = req.body.title;
          movie.year = req.body.year;
          movie.genre = req.body.genre;
          movie.actors = req.body.actors;

          movie.save(function (err) {
            if (err) {
              res.send(err);
            } else {
              res.json({
                success: true,
                msg: "Movie updated!",
                title: movie.title,
                year: movie.year,
                genre: movie.genre,
                actors: movie.actors,
              });
            }
          });
        }
      });
    }
  })

  .delete(jwtController.isAuthenticated, function (req, res) {
    if (!req.body.title) {
      res.json({
        success: false,
        msg: "Request body MUST have a title.",
      });
    } else {
      Movie.findOneAndDelete({ title: req.body.title }).exec(function (
        err,
        movie
      ) {
        if (err) res.send(err);
        else
          try {
            res.json({
              success: true,
              deleted: true,
              title: movie.title,
              year: movie.year,
              genre: movie.genre,
              actors: movie.actors,
            });
          } catch (error) {
            res.json({
              success: false,
              msg: "Movie not found!",
            });
          }
      });
    }
  });

router
  .route("/signup")
  .post(function (req, res) {
    if (!req.body.username || !req.body.password) {
      res.json({
        success: false,
        msg: "Please include both username and password",
      });
    } else {
      var user = new User();
      user.name = req.body.name;
      user.username = req.body.username;
      user.password = req.body.password;

      user.save(function (err) {
        if (err) {
          if (err.code == 11000)
            return res.json({
              success: false,
              message: "Duplicate Username!!!",
            });
          else return res.json(err);
        }
        console.log(req.body);
        res.json({ success: true, msg: "Successfully created new user." });
      });
    }
  })
  .all(function (req, res) {
    res.json({
      success: false,
      msg: "Request type must be POST.",
    });
  });

router
  .route("/signin")
  .post(function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username })
      .select("name username password")
      .exec(function (err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function (isMatch) {
          if (isMatch) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({ success: true, token: "JWT " + token });
          } else {
            res.status(401).send({
              success: false,
              msg: "Authentication failed, incorrect password",
            });
          }
        });
      });
  })

  .all(function (req, res) {
    res.json({
      success: false,
      msg: "Request type must be POST.",
    });
  });

router.route("/").all(function (req, res) {
  res = res.status(401).send({
    success: false,
    msg: "Request cannot be made to base address.",
  });
});

app.use("/", router);
app.listen(port, () => console.log(`Listening on port ${port}!`));
module.exports = app; // for unit testing ??

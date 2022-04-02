var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");
require("dotenv").config();

mongoose.Promise = global.Promise;

try {
  mongoose.connect(
    process.env.DB,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("connected to users collection")
  );
} catch (error) {
  console.log(error);
  console.log("could not connect to users collection");
}
// mongoose.set("useCreateIndex", true); google said this was deprecated

//create user schema
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
});

userSchema.pre("save", function (next) {
  var user = this;
  //hash password
  if (!user.isModified("password")) return next(); //if user didn't change password

  //user did change password
  bcrypt.hash(user.password, null, null, function (err, hash) {
    if (err) return next(err);

    //change the password to the hash
    user.password = hash;
    next();
  });
});

userSchema.methods.comparePassword = function (password, callback) {
  var user = this;

  bcrypt.compare(password, user.password, function (err, isMatch) {
    callback(isMatch);
  });
};

//return model to server
module.exports = mongoose.model("User", userSchema);

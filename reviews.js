var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;

try {
  mongoose.connect(
    process.env.DB,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("connected to mongodb from reviews file")
  );
} catch (error) {
  console.log("could not connect from reviews file");
}
var reviewSchema = new Schema({
  title: { type: String, required: true },
  userID: { type: String, required: true },
  comment: { type: String, required: false, maxLength: 4096 },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

//return model to server
module.exports = mongoose.model("Review", reviewSchema);

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;

try {
  mongoose.connect(
    process.env.DB,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("connected to mongodb from movies file")
  )
} catch (error) {
  console.log("could not connect from movies file");
}

//create user schema
var movieSchema = new Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true, min: 1900, max: 2030 },
  genre: {
    type: String,
    required: true,
    enum: [
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Thriller",
      "Western",
    ],
  },
  actors: [
    {
      actorName: String,
      CharacterName: String,
    },
  ],
  
});

//return model to server
module.exports = mongoose.model("Movie", movieSchema);
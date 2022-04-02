// require('./movies'); //should execute mongoose.connect() i think
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;

// console.log("Mongoose connection state: ", mongoose.STATES[mongoose.connection.readyState])
// // This should connect to our mongodb if we aren't already for some reason
// if (mongoose.connection.readyState == 0) {

    try {
        mongoose.connect(
            process.env.DB,
            { useNewUrlParser: true, useUnifiedTopology: true },
            () => console.log("connected to mongodb from reviews file")
        );
    } catch (error) {
        console.log("could not connect from reviews file");
    }
// }
// else console.log("Already connected from movies.js");

// if (mongoose.connection.readyState == 2) { 
//     await mongoose.connection.readyState == 1;
// }
//create review schema
var reviewSchema = new Schema({
  name: { type: String, required: true },
  comment: { type: String, required: false, maxLength: 4096},
  rating: { type: Number, required: true, min: 1, max: 5}
});

//return model to server
module.exports = mongoose.model("Review", reviewSchema);
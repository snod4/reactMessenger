const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/organizedMessengerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


mongoose.set("useCreateIndex", true);
//Checking for good connection to db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log("DB connected successfully");
});

module.exports = mongoose.connection;

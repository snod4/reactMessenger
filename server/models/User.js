const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    onGoingConversations: Array, //Keeps list of ongoing conversations (OnGoingConvo objects) of a user
    realName: String, //Keeps actual name of user
  
  
  });

  userSchema.plugin(passportLocalMongoose);

  module.exports = mongoose.model('User' , userSchema);
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    convo: Array //keeps list of Message objects
  });
  

module.exports = mongoose.model("Conversation", conversationSchema);
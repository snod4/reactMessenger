var express = require("express");
var router = express.Router();
const passport = require("passport");
const {OnGoingConvo} = require('../helper.js');
const User = require('../models/User.js');
const Conversation = require('../models/Conversation.js');



/*
Route that handles user lookup for new conversations.
*/

router.post("/userLookup",(req, res) => {
    if(req.isAuthenticated()){
    console.log(`userLookup User: ${req.user}`)
    const userId = req.user._id;
    const name = req.body.name;
    console.log(name);
    // User.find({}, (err, docs) => {
    //   console.log("All Users")
    //   console.log(docs);
    // })
  
    const regex = new RegExp(name, "i");
    User.find({ //finds users with name starting with 'name' excluding the user's
      realName: regex,
      _id: {
        $ne: userId
      }
    }, (err, docs) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Found")
      console.log(docs);
      res.send(JSON.stringify(docs));
    })
  }
  });


 /*
 The route that handles the ChatView on load. When a conversation is first
 selected, it fetches its data from this route.
 */
router.post("/chat", (req, res) => {
    if(req.isAuthenticated()){
    console.log("Got to Chat POST")
    const convoId = req.body.convoId;
    const recipientId = req.body.recipientId;
    const senderId = req.body.senderId;
    const recipientName = req.body.recipientName;
    let senderName = "";
    console.log(`senderId: ${senderId}, recipientId: ${recipientId}, convoID: ${convoId}, recipientName: ${recipientName}`)
    res.setHeader('Content-Type', 'application/json');
    if (convoId === null) {
      //if the conversation has just started, make a new conversation and update
      //the user and recipient to have it. Consider making it so the conversation
      //is created when the first message is sent
      const convo = new Conversation([]);
      convo.save();
      let workingArr = [];
      User.findById(senderId, (err, sender) => { //Update the creator of the conversation
        if (err) {
          console.log(err);
          return;
        }
        senderName = sender.realName;
        User.updateOne({
            _id: senderId
          }, {
            $set: {
              onGoingConversations: [...sender.onGoingConversations, new OnGoingConvo(convo._id, recipientId, recipientName, "")]
            }
          },
          (err) => {
            if (err) {
              console.log(err)
            }
          });
      });
  
  
      User.findById(recipientId, (err, recipient) => { //update the recipient of the conversation
        if (err) {
          console.log(err);
          return;
        }
        User.updateOne({
          _id: recipientId
        }, {
          $set: {
            onGoingConversations: [...recipient.onGoingConversations, new OnGoingConvo(convo._id, senderId, senderName, "")]
          }
        }, (err) => {
          if (err) {
            console.log(err)
          }
        })
      });
  
      console.log("Sending data of IF")
      res.send(JSON.stringify({
        data: []
      }));
    } else { //Conversation already exists and it just its contents just need to be sent back.
      User.findById(senderId, (err, user) => { //Turns off notification status if it is on because user is looking at conversation now
        if (err) {
          console.log(err);
          return;
        }
        for (let i = 0; i < user.onGoingConversations.length; i++) {
          if (user.onGoingConversations[i].recipientId === recipientId){
            console.log("Turing off notification");
          user.onGoingConversations[i].newMessage = false;
          User.updateOne({
            _id: senderId
          }, {
            $set: {
              onGoingConversations: user.onGoingConversations
            }
          }, err => {
            if (err) {
              console.log(err);
            }
          })
          break;
        }
        }
      });
  
      Conversation.findById(convoId, (err, convo) => { //sends conversation data back to user
        if (err) {
          console.log(err);
          return;
        }
        console.log("Sending data of ELSE")
        res.send(JSON.stringify({
          data: convo.convo
        }));
      })
    }
  }
  });


  module.exports = router;
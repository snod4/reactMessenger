
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require('./models/User.js');
const Conversation = require('./models/Conversation.js');

/*
Relays whether the login/register attempt was successful to the client
success: bool denoting successful login/Register
req: standard HTTP request object with user cookie attached
res: standard HTTP response object
*/


let openConnections = new Map(); //Stores UserConnections using their reference values as keys
let idToConnection = new Map(); //Find a way to merge these two Hashmaps

//What openConnections stores
function UserConnection(id, connection) {
  this.id = id; //id of the user connected
  this.connection = connection; // the websocket connection of the user
}


function OnGoingConvo(convoId, recipientId, name, img) {
  this.recipientId = recipientId; //id of person a user is talking to
  this.convoId = convoId;
  this.recipientName = name;
  this.recipientPhoto = img;
  this.newMessage = false;
  this.mostRecentMessage = null;
}



function isLogin(success, req, res) {
    if (success) {
      console.log("Sending back these conversations")
      console.log(req.user.onGoingConversations)
      console.log("Sending back user info")
      console.log(req.user)
      return res.send(JSON.stringify({
        isLoggedIn: true, //Make this right
        convos: req.user.onGoingConversations,
        id: req.user._id
      }))
    } else {
      return res.send(JSON.stringify({
        login: false,
        convos: [],
        id: -1
      }))
    }
  }
  
  /*
  helper function that adds message to database and notifies recipient.
  convoId: _id of Conversation Document
  senderId: _id of User who sent message
  recipientId: _id of User who receives message
  message: message, String
  name: name of sender. Passed through this to sendToRecipient.
  */
  function addToConveration(convoId, senderId, recipientId, message, images, name) {
    Conversation.findById(convoId, (err, convo) => {
      if (err) {
        console.log(err);
      } else {
         Conversation.updateOne({
          _id: convoId
        }, {
          $set: {
            convo: [...convo.convo, {
              id: senderId,
              message: message,
              images: images
            }]
          }
        }, (err) => {
          if (err) {
            console.log(err);
            return;
          }
           sendToRecipient(recipientId, senderId, message, images, name, convoId);
          console.log("Successfully added message");
        })
  
      }
    })
  
  
  }
  
  /*
  helper function that notifies recipient.
  convoId: _id of Conversation Document
  senderId: _id of User who sent message
  recipientId: _id of User who receives message
  message: message, String
  name: name of sender. Sent in notification in case sender sent message before
  reciever's client-side onGoingConversations has been updated to include sender's
  conversation
  */
   function sendToRecipient(recipientId, senderId, message, images, name, convoId) {
    console.log("Got to sending to recipeint");
    const ws = idToConnection.get(recipientId);
    User.findOne({
      _id: recipientId
    }, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Found recipient: ${user}`);
      console.log(`SenderId: ${senderId}`);
      const userConvos = user.onGoingConversations;
      //adds notification status to recipient's sender conversation
      for (let i = 0; i < userConvos.length; i++) {
        let thisConvo = userConvos[i];
        console.log(thisConvo.recipientId.toString() === senderId.toString());
        if (thisConvo.recipientId.toString() === senderId.toString()) {
          thisConvo.newMessage = true;
          console.log(userConvos);
          console.log(user.onGoingConversations);
          break;
        }
      }
      User.updateOne({
        _id: recipientId
      }, {
        $set: {
          onGoingConversations: user.onGoingConversations
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
      })
      console.log("Notified recipient");
  
      User.findById(recipientId, (err, user) => {
        console.log(user);
      });
  
      //sends message right to recipient if server has active connnection
      //and tells them there's a new message
      if (ws) {
        console.log("Active connection to recipient");
        ws.send(JSON.stringify({
          senderId: senderId,
          message: message,
          images: images,
          senderName: name,
          convoId: convoId
        }));
      }
  
  
    })
  
  }
  
  /*
  Updates onGoingCoversations to have most recent message
  
  */
  function updateOnGoingConversations(userId) {
    User.findById(userId, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
  
      console.log("UpdateUserConvo");
      console.log(user);
  
      user.onGoingConversations.forEach((convo, i) => {
        Conversation.findById(convo.convoId, (err, conversation) => {
          const mostRecent = conversation.convo[conversation.convo.length - 1];
          convo.mostRecentMessage = mostRecent;
          User.updateOne({
            _id: user._id
          }, {
            $set: {
              onGoingConversations: user.onGoingConversations
            }
          }, (err) => {
            if (err) console.log(err)
          })
        });
      });
  
    })
  }



  

  

  module.exports = {

    UserConnection:UserConnection,
    openConnections:openConnections,
    idToConnection:idToConnection,
    OnGoingConvo:OnGoingConvo,
    isLogin: isLogin,
    updateOnGoingConversations: updateOnGoingConversations,
    addToConveration :addToConveration,
    sendToRecipient: sendToRecipient
  };
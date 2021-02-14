const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const mongoose = require("mongoose");
const db = require('./db/dbSetup.js'); //database
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require('./models/User.js'); //mongoDB User data structure
const Conversation = require('./models/Conversation.js'); //mongoDB Conversation data structure

const apiRoutes = require('./routes/apiRoutes.js'); 
const authenicationRoutes = require('./routes/authenticationRoutes.js');
const {openConnections, idToConnection, UserConnection, updateOnGoingConversations, addToConveration, sendToRecipient, isLogin, Message, OnGoingConvo} = require('./helper.js');



///////////////// APP SETUP //////////////////////////////////////////////
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json()); // for parsing application/json
app.use(pino);
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));



//Unsure if this is necessary anymore -- review this
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(apiRoutes);
app.use(authenicationRoutes);

//Set up express app to listen on port 3001
app.listen(process.env.PORT || 3001, () =>
  console.log('Express server is running on localhost:3001')
);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




///////////////////// WEBSOCKET ///////////////////////////////////
/*
Use of websockets may be somewhate redundant. Could redesign to have Websockets
ping client when new message has been recieved and if client is in ChatView
relevant to message, have it fetch all conversation data again. Could be issue
when converation is large however.
*/

const WebSocket = require('ws');


const wss = new WebSocket.Server({
  server: app.listen(8080)
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}




wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  let userConnection = new UserConnection(null, ws);
  //D console.log("Connection Established");
  ws.on('close', function closeConnection() {
    console.log("Closing Connection")
  //  updateOnGoingConversations(openConnections.get(ws).id);
    const id = openConnections.get(ws).id;
    openConnections.delete(ws);
    idToConnection.delete(id);


  })

  ws.on('message', function incoming(message) {



    if (userConnection.id == null) { //first message should contain information about the user -- id
      userConnection.id = message;

      openConnections.set(ws, userConnection); //Hashmap
      idToConnection.set(userConnection.id, ws);
      //D console.log(`Entries: ${openConnections.size} `)


      //D console.log(`Connection ${message} successfully added`);
    } else {
      // openConnections.forEach((value, key) => {
      //   //D console.log(`Key: ${key} and Value ${value} of openConnections`);
      // }) //otherwise, messages should come in a JSON format -- change this
      const messageJson = JSON.parse(message);
      //D console.log(`incoming message:`);
      //D console.log(messageJson);
      //D console.log(openConnections.get(this))

      User.findOne({ //Add message to database and notify the recipient
        _id: openConnections.get(this).id
      }, (err, user) => {
        if (err) {
           console.log(err);
        } else {
          //D console.log(`Sender: ${user}`)
          let convoArr = user.onGoingConversations;
          convoArr.forEach((item, i) => {
            //D console.log(`messageId: ${messageJson.recipientId}, itemID: ${item.recipientId}`);
            if (messageJson.recipientId === item.recipientId) {
              //D console.log("Found recipeint");
              addToConveration(item.convoId, user._id, messageJson.recipientId, messageJson.message, messageJson.images, user.realName);
              //D console.log("Passed addConvo")
              updateOnGoingConversations(user._id);
              updateOnGoingConversations(item.recipientId);


            }
          });
        }

      })
    }


    //D console.log('received: %s', message);
  });

});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      //updateOnGoingConversations(openConnections.get(ws).id);
      const id = openConnections.get(ws).id;
      openConnections.delete(ws);
      idToConnection.delete(id);
      return ws.terminate();

    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);





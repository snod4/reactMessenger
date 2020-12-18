const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const mongoose = require("mongoose");
const session = require("express-session");

const path = require("path");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


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

//Set up express app to listen on port 3001
app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
/////////////////////// DATABASE CONNECTION AND MODELS//////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/messengerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
//Checking for good connection to db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log("DB connected successfully");
})


const userSchema = new mongoose.Schema({
  onGoingConversations: Array, //Keeps list of ongoing conversations (OnGoingConvo objects) of a user
  realName: String, //Keeps actual name of user


});

userSchema.plugin(passportLocalMongoose);

function OnGoingConvo(convoId, recipientId, name, img) {
  this.recipientId = recipientId; //id of person a user is talking to
  this.convoId = convoId;
  this.recipientName = name;
  this.recipientPhoto = img;
  this.newMessage = false;
  this.mostRecentMessage = null;
}

function Message(id, message) {
  this.id = id; //id of the user who sent the message
  this.message = message;
}
const conversationSchema = new mongoose.Schema({
  convo: Array //keeps list of Message objects
});

//connects passport to mongoose
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Conversation = mongoose.model("Conversation", conversationSchema);



///////////////////// WEBSOCKET ///////////////////////////////////
/*
Use of websockets may be somewhate redundant. Could redesign to have Websockets
ping client when new message has been recieved and if client is in ChatView
relevant to message, have it fetch all conversation data again. Could be issue
when converation is large however.
*/
let openConnections = new Map(); //Stores UserConnections using their reference values as keys
let idToConnection = new Map(); //Find a way to merge these two Hashmaps

//What openConnections stores
function UserConnection(id, connection) {
  this.id = id; //id of the user connected
  this.connection = connection; // the websocket connection of the user
}



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
  console.log("Connection Established");
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
      console.log(`Entries: ${openConnections.size} `)


      console.log(`Connection ${message} successfully added`);
    } else { //otherwise, messages should come in a JSON format -- change this
      const messageJson = JSON.parse(message);
      console.log(`incoming message:`);
      console.log(messageJson);
      console.log(openConnections.get(this))

      User.findOne({ //Add message to database and notify the recipient
        _id: openConnections.get(this).id
      }, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Sender: ${user}`)
          let convoArr = user.onGoingConversations;
          convoArr.forEach((item, i) => {
            console.log(`messageId: ${messageJson.recipientId}, itemID: ${item.recipientId}`);
            if (messageJson.recipientId === item.recipientId) {
              console.log("Found recipeint");
              addToConveration(item.convoId, user._id, messageJson.recipientId, messageJson.message, user.realName);
              console.log("Passed addConvo")
              updateOnGoingConversations(user._id);
              updateOnGoingConversations(item.recipientId);


            }
          });
        }

      })
    }


    console.log('received: %s', message);
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




/////////////////////// APP ROUTING ////////////////////////////////////

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


/*
  Handles home route of the app.
  Ideally, checks to see if the user is autheticated and if so, sends them straight to the application.
  Otherwise, they get sent to a login screen, which is handled clientside via React
*/
app.route('/home').get((req, res) => {
  console.log("Got to home route");
  if (req.isAuthenticated()) {
    console.log(`User: ${req.user}`);
    return isLogin(true, req, res);
  } else {
    console.log("User: FALSE");
    return isLogin(false, req, res);
  }

});



/*
The route that handles the ChatView on load. When a conversation is first
selected, it fetches its data from this route.
*/
app.route('/chat').post((req, res) => {
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

/*
Login route handles submission from login form and logs user in. It attatches
a cookie to a user's session so that they don't need to log in every time.
Uses passport to handle authentication
*/
app.post("/login", (req, res) => {

  console.log("Login Post");
  User.findOne({
    username: req.body.user
  }, (err, user) => {
    if (err) {
      console.log(err);
      return;
    }
    user._doc.password = req.body.password;
    console.log(typeof user);
    console.log(`Modified User: ${user}`);

    console.log(`Login info:
                  Username: ${req.body.user}
                  Password: ${req.body.password}`);


    user.authenticate(req.body.password, (err, user, info) => {
      console.log(err);
      console.log(user);
      console.log(info);
      if (user) {
        console.log("Successful Login");
        req.login(user, (err) => {
          if (err) {
            console.log(err);
            return;
          }
          return isLogin(true, req, res);
        });
      } else {
        console.log("Failed Login");
        return isLogin(false, req, res);
      }
    })

  });

});

/*
Register route handles submission from register form and registers user and
also logs them in. It attatches a cookie to a user's session so that they don't
need to log in every time
Uses passport to handle authentication

*/
app.route("/register").post((req, res, next) => {
  console.log("Posted to register route");
  User.register({
    username: req.body.user
  }, req.body.password, (err, user) => {


    if (err) {
      console.log("On failure send: " + JSON.stringify({
        success: false
      }));
      console.log(err);
      res.send(JSON.stringify({
        sucess: false
      }));

    } else {
      User.updateOne({
        _id: user._id
      }, {
        $set: {
          realName: req.body.name
        }
      }, (err) => {
        if (err) {
          console.log(err);
          return;
        }
      });
      console.log("Got to register login point");

      req.login(user, (err) => {
        if (err) {
          console.log(err);
        } else {
          let authenticate = User.authenticate();
          authenticate(req.body.user, req.body.password, (err, user, info) => {
            console.log(err);
            console.log(user);
            console.log(info);
            if (user) {
              console.log("Successfully Reg");
              return isLogin(true, req, res);
            } else {
              console.log("Failed Reg");
              return isLogin(false, req, res);
            }
          })
        }
      })

    }

  });


})

//Consider replacing this with Websockets to avoid repeated requests
/*
Route that handles user lookup for new conversations.
*/
app.route("/userLookup").post((req, res) => {
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
})




//////////////////////// HELPER FUNCTIONS ////////////////////

/*
Relays whether the login/register attempt was successful to the client
success: bool denoting successful login/Register
req: standard HTTP request object with user cookie attached
res: standard HTTP response object
*/
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
function addToConveration(convoId, senderId, recipientId, message, name) {
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
            message: message
          }]
        }
      }, (err) => {
        if (err) {
          console.log(err);
          return;
        }
         sendToRecipient(recipientId, senderId, message, name, convoId);
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
 function sendToRecipient(recipientId, senderId, message, name, convoId) {
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

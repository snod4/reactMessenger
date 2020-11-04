const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


///////////////// APP SETUP //////////////////////////////////////////////
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json()); // for parsing application/json
app.use(pino);

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
let openConnections = new Map(); //Stores UserConnections using their reference values as keys

//What openConnections stores
function UserConnection(id, connection) {
  this.id = id; //id of the user connected
  this.connection = connection; // the websocket connection of the user
}



const WebSocket = require('ws');


const wss = new WebSocket.Server({
  server: app.listen(8080)
});

wss.on('connection', function connection(ws) {
  let userConnection = new UserConnection(null, ws);
  console.log("Connection Established");
  ws.on('message', function incoming(message) {

    if (userConnection.id == null) { //first message should contain information about the user -- id
      userConnection.id = message;
      openConnections[ws] = userConnection; //HashMap
      console.log(`Connection ${message} successfully added`);
    } else { //otherwise, messages should come in a JSON format -- change this
      const messageJson = JSON.parse(message);
      console.log(`incoming message:`);
      console.log(messageJson);

      User.findOne({
        _id: openConnections[this].id
      }, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Intended Recipeint: ${user}`)
          let convoArr = user.onGoingConversations;
          convoArr.forEach((item, i) => {
            console.log(`messageId: ${messageJson.recipientId}, itemID: ${item.recipientId}`);
            if (messageJson.recipientId === item.recipientId) {
              console.log("Found recipeint")
              Conversation.findById(item.convoId, (err, convo) => {
                if (err) {
                  console.log(err);
                } else {
                  Conversation.updateOne({_id: item.convoId}, {$set: {convo: [...convo.convo,  {
                    id: user._id,
                    message: messageJson.message
                  }]}}, (err) => {
                    if(err){
                      console.log(err);
                      return;
                    }
                  })
                  //Notify recipient somehow
                  console.log("Successfully added message");
                }
              })
            }
          });
        }

      })
    }


    console.log('received: %s', message);
  });
  //Sends something back to tell client the connection has been made -- change what is sent
  ws.send(JSON.stringify({
    test: `user ${userConnection.id} added`
  }));
});



/////////////////////// APP ROUTING ////////////////////////////////////
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
  console.log("Got to Chat POST")
  const convoId = req.body.convoId;
  const recipientId = req.body.recipientId;
  const senderId = req.body.senderId;
  const recipientName = req.body.name;
  let senderName = "";
  console.log(`senderId: ${senderId}, recipientId: ${recipientId}, convoID: ${convoId}`)
  res.setHeader('Content-Type', 'application/json');
  if (convoId === null) {
    //if the conversation has just started, make a new conversation and update
    //the user and recipient to have it. Consider making it so the conversation
    //is created when the first message is sent
    const convo = new Conversation([]);
    convo.save();
    let workingArr = [];
    User.findById(senderId, (err, sender) => {
      if (err) {
        console.log(err);
        return;
      }
      senderName = sender.realName;
      User.updateOne({
        _id: senderId
      },
      {
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


    User.findById(recipientId, (err, recipient) => {
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
  } else {
    //If conversation is established, just load the conversation.
    Conversation.findById(convoId, (err, convo) => {
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
});

// app.post('/login', (req, res, next) => {
//
//   console.log("got to login post");
//   passport.authenticate('local',
//   (err, user, info) => {
//     console.log("Got to login callback")
//     if (err) {
//       return next(err);
//     }
//
//     if (!user) {
//       return res.redirect('/login?info=' + info);
//     }
//
//     req.logIn(user, function(err) {
//       if (err) {
//         return next(err);
//       }
//
//       return res.redirect('/');
//     });
//
//   })(req, res, next);
// });
app.post("/login", (req, res) => {

  console.log("Login Post");
  User.findOne({
    username: req.body.user
  }, (err, user) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(typeof user)
    user._doc.password = "This is a test";
    console.log(`Modified User: ${user}`);
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      let authenticate = User.authenticate();
      authenticate(req.body.user, req.body.password, (err, result) => {
        if (!err) {
          console.log("Successfully Reg");
          return isLogin(true, req, res);
        } else {
          console.log("Failed Reg");
          return isLogin(false, req, res);
        }
      })
    });
    // //});
    // /////Figure out how to get the real id of the user, not the id of the temporary document created for authentication --look at passport strategies?? can be mixed with mongoose-local?
    //
    //
    //

    //  }
    //})

  });
});

/*
Route that handles user registration.
*/
app.route("/register").post((req, res, next) => {
  console.log("Posted to register route");
  User.register({
    username: req.body.user
  }, req.body.password, (err, user) => {
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

    if (err) {
      console.log("On failure send: " + JSON.stringify({
        success: false
      }));
      console.log(err);
      res.send(JSON.stringify({
        sucess: false
      }));

    } else {
      req.login(user, (err) => {
        if (err) {
          console.log(err);
        } else {
          let authenticate = User.authenticate();
          authenticate(req.body.user, req.body.password, (err, result) => {
            if (!err) {
              console.log("Successfully Reg");
              return isLogin(true, req, res);
            } else {
              console.log("Failed Reg");
              return isLogin(false, req, res);
            }
          })
        }
      })
      // passport.authenticate("local")(req,res, (err) => {
      //   console.log("what the fuck");
      //   if(err){
      //     res.send(JSON.stringify({sucess:false}));
      //   }
      //   else{
      //     res.send(JSON.stringify({success:true}));
      //   }
      // })
    }

  });


})

//Consider replacing this with Websockets to avoid repeated requests
/*
Route that handles user lookup for new conversations.
*/
app.route("/userLookup").post((req, res) => {
  const name = req.body.name;
  console.log(name);
  User.find({}, (err, docs) => {
    console.log("All Users")
    console.log(docs);
  })

  const regex = new RegExp(name, "i");
  User.find({
    realName: regex
  }, (err, docs) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Found")
    console.log(docs);
    res.send(JSON.stringify(docs));
  })
})




//////////////////////// HELPER FUNCTIONS ////////////////////

/*
Relays whether the login/register attempt was successful to the client
success: bool denoting successful login/Register
req: standard HTTP request object
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

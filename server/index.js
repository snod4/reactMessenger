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


app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
/////////////////////// DATABASE CONNECTION AND MODELS//////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/messengerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log("DB connected successfully");
})

/**
Change so that messages relies on name of sender/recipient to organize rather than boolean
Figure out why realName isn't being recorded in DB -- for some reason, if realName is a string, it won't be recorded....?
*/
const userSchema = new mongoose.Schema({
  onGoingConversations: Array,
  realName: String,


});

userSchema.plugin(passportLocalMongoose);

function OnGoingConvo(name, convoId) {
  this.name = name;
  this.convoId = convoId;
}

function Message(name, message) {
  this.name = name;
  this.message = message;
}
const conversationSchema = new mongoose.Schema({
  convo: Array
});
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Conversation = mongoose.model("Conversation", conversationSchema);



///////////////////// WEBSOCKET ///////////////////////////////////
let openConnections = new Map();

function UserConnection(id, connection) {
  this.id = id;
  this.connection = connection;
}



const WebSocket = require('ws');


const wss = new WebSocket.Server({
  server: app.listen(8080)
});

wss.on('connection', function connection(ws) {
  let userConnection = new UserConnection(null, ws);
  console.log("Connection Established");
  ws.on('message', function incoming(message) {

    if (userConnection.id == null) {
      userConnection.id = message;
      openConnections[ws] = userConnection; //HashMap
      console.log(`Connection ${message} successfully added`);
    } else {
      const messageJson = JSON.parse(message);
      User.findOne({id: openConnections[this].id}, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          let convoArr = user.onGoingConversations;
          convoArr.forEach((item, i) => {
            if (messageJson.recpient === item.name) {
              Conversation.findById(item.convoId, (err, convo) => {
                if (err) {
                  console.log(err);
                } else {
                  convo.convo = [...convo.convo, {
                    name: user.name,
                    message: messageJson.message
                  }];
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

  ws.send(JSON.stringify({
    test: "Hello Something"
  }));
});
/**
Things to consider:
  Put Messages in Database so they stay consistent
    Otherwise just send message straight to client
    If in database, how to find entry and update messages
*/


/////////////////////// APP ROUTING ////////////////////////////////////
app.route('/home').get((req, res) => {
  console.log("Got to home route");
  if (req.isAuthenticated()) {
    console.log(`User: ${req.user}`);
    return isLogin(true, req, res);
  } else {
    console.log("User: FALSE");
    return isLogin(false, req, res);;
  }

});

app.route('/chat').get((req, res) => {
  console.log("Got to Chat get")
  const id = req.query.id || null;
  res.setHeader('Content-Type', 'application/json');
  if (id !== null) {
    Conversation.findById(id, (err, result) => {
      if(err){
        console.log(err);
        return;
      }
      res.send(JSON.stringify(result));
    })

  }

});


app.route("/login").post((req, res) => {
  const user = new User({
    username: req.body.user,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      let authenticate = User.authenticate();
      authenticate(req.body.user, req.body.password, (err, result) => {
        if (!err) {
          console.log(`User: ${req.user}`);
          return isLogin(true, req, res);
        } else {
          console.log("Failed Reg");
          return isLogin(false, req, res);;
        }
      })
    }
  })

});

app.route("/register").post((req, res, next) => {
  console.log("Posted to register route");
  User.register({
    username: req.body.user
  }, req.body.password, (err, user) => {
    User.updateOne({_id: user._id}, {$set: {realName:req.body.name}}, (err) => {if(err){
      console.log(err);
      return;
    }})

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
//TEST NAME LOOKUP NEXT
app.route("/userLookup").post((req, res) => {
  const name = req.body.name;
  console.log(name);
  User.find({}, (err,docs) => {
    console.log("All Users")
    console.log(docs);
  })

  const regex = new RegExp(name, "i");
  User.find({realName:regex}, (err, docs) => {
    if(err){
      console.log(err);
      return;
    }
    console.log("Found")
    console.log(docs);
    res.send(JSON.stringify(docs));
  })
})




//////////////////////// HELPER FUNCTIONS ////////////////////

function isLogin(success, req, res){
  if(success){
    return res.send(JSON.stringify({
      login: true,
      convos: req.user.onGoingConversations,
      id: req.user._id
    }))
  }
  else{
    return res.send(JSON.stringify({
      login: false,
      convos: [],
      id: -1
    }))
  }
}

const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/messengerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("DB connected successfully");
})

  const chatSchema = new mongoose.Schema({
    name: String,
    messages: Array
  });

  const Chat = mongoose.model("Chat", chatSchema);
  (new Chat({name:"testing"})).save();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // for parsing application/json
app.use(pino);

app.route('/chat').get((req, res) => {
  console.log("Got to Chat get")
  const id = req.query.id || null;
  res.setHeader('Content-Type', 'application/json');
  if(id !== null){
Chat.findById(id, function(err, item){
  res.send(JSON.stringify(item));  });
  }

})
.post((req, res) => {
  console.log("Got to Chat POST");
  const data = req.body;
  console.log(data);
  if(data._id !== null){
    Chat.update({_id: data._id}, req.body, function(err){
      Chat.findById(data._id, function(err,item){
          res.send(JSON.stringify(item));
      });
    });

  }
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);

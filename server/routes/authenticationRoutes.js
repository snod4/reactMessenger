var express = require("express");
var router = express.Router();
const passport = require("passport");
const {isLogin} = require('../helper.js');
const User = require('../models/User.js');



/*
  Handles home route of the app.
  Ideally, checks to see if the user is autheticated and if so, sends them straight to the application.
  Otherwise, they get sent to a login screen, which is handled clientside via React
*/

router.get("/home", (req, res) => {
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
Login route handles submission from login form and logs user in. It attatches
a cookie to a user's session so that they don't need to log in every time.
Uses passport to handle authentication
*/
router.post("/login", (req, res) => {

    console.log("Login Post");
    User.findOne({
      username: req.body.user
    }, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      else if(user==null){
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
  router.post("/register", (req, res, next) => {
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

  router.post("/logout", (req, res) => {
    req.logout();
    res.send();
  })

  module.exports = router;
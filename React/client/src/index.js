import React, {useState} from "react";
import ReactDOM from "react-dom";
import App from "./App";




console.log("In index.js testing")
console.log(`process.env.PROXY_API = ${process.env.REACT_APP_API_URL + "/home"}`)

fetch(process.env.REACT_APP_API_URL + "/home").then(response => {
  console.log(response);
  return response.json()
})
.then(loginJson => {
  console.log(`index.js Login: ${loginJson.isLoggedIn}`);
  ReactDOM.render(<App loginResults = {loginJson}/>, document.getElementById("root"));
  return;
}).catch(err => console.log(err));






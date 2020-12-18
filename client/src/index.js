
import React, {useState} from "react";
import ReactDOM from "react-dom";
import App from "./App";



console.log("In index.js")

fetch("/home").then(response => response.json()).then(loginJson => {
  console.log(`index.js Login: ${loginJson.isLoggedIn}`);
  ReactDOM.render(<App loginResults = {loginJson}/>, document.getElementById("root"));
  return;
})





// app.listen(process.env.PORT || 8080, () => {
//   console.log("App listening on port 8080");
// })

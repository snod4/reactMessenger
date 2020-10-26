
import React, {useState} from "react";
import ReactDOM from "react-dom";
import App from "./App";





fetch("/home").then(response => response.json()).then(loginJson => {
  console.log(loginJson.login);
  ReactDOM.render(<App login = {loginJson.login}/>, document.getElementById("root"));
  return;
})





// app.listen(process.env.PORT || 8080, () => {
//   console.log("App listening on port 8080");
// })

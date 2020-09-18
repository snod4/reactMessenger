import React from "react";
import Heading from "./Heading";
import Sidebar from "./Sidebar";
import ChatView from "./ChatView";
function App(){
  return (
    <div style = {{height:"inherit"}}>
  

        <div className = "row "  style= {{margin: "auto", height: "81%"}}>
        <div className = "col-2">
        <Sidebar />
        </div>
        <div className = "col" style = {{height: "auto", paddingBottom: "0", marginBottom: "0"}} >
        <ChatView />
        </div>

      </div>

    </div>


  );

}

export default App;

import React from "react";

function MessageHeader(props){
      const id = 0;
  return (
    <div className = "messageHeader" onClick = {() => props.selectConversation(id)}>
    <div className = "row">
        <div className ="profilePic col-3">
          <img src = {props.image} alt  = "profile picture"/>
        </div>
        <div className = "messageInfo col">
          <h3>{props.name}</h3>
          <p>{props.content.substr(0, 30) + " . . ."}</p>
        </div>
      </div>
      </div>
      );
}

export default MessageHeader;

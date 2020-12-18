import React from "react";

function MessageHeader(props){
    let messageHeader = "message-header";
    let activeClass = messageHeader;
    if(props.notify){
      activeClass = messageHeader + " notify";
    }
  return (
    <div className = {activeClass} onClick = {() => {
      props.convoRef.newMessage = false; //Sketchy solution. Fix?
      props.selectConverstation(props.name, props.convoId, props.recipientId)}}>
    <div className = "row">
        <div className ="profilePic col-3">
          <img src = {props.image} alt  = "profile picture"/>
        </div>
        <div className = "messageInfo col">
          <h3>{props.name}</h3>
          <p>{props.content != null ? props.content.message.length >= 30 ? props.content.message.substr(0, 30) + " . . ." :props.content.message.substr(0, 30) : "Send this person a message"}</p>
        </div>
      </div>
      </div>
      );
}

export default MessageHeader;

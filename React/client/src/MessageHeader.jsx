import React from "react";

function MessageHeader(props){
    let messageHeader = "message-header";
    let activeClass = messageHeader;
    if(props.notify){
      activeClass = messageHeader + " notify";
    }

    function handleRemove(){
    fetch(process.env.REACT_APP_API_URL+ "/removeConvo", {

      // Adding method type
      method: "POST",

      // Adding body or contents to send
      body: JSON.stringify({convoId: props.convoId, recipientId: props.recipientId}),

      // Adding headers to the request
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
    })
    props.removeFromConvoArr(props.convoRef);
  }
  return (
    <div className = {activeClass} onClick = {() => {
      props.convoRef.newMessage = false; //Sketchy solution. Fix?
      props.selectConverstation(props.name, props.convoId, props.recipientId)}}>
    <div className = "row">
        <div className ="profilePic col-3">
          <img src = {props.image} alt  = "profile picture"/>
        </div>
        <div className = "messageInfo col-8">
          <h3>{props.name}</h3>
          <p>{props.content != null ? ((props.content.message != null) ? props.content.message.substr(0, 30) :"Sent a photo") : "Send this person a message"}</p>
        </div>
        <div className = "message-header-options col-1">
        <div className="align-self-center dropdown">
                    <button className="messeage-header-options-btn" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        ...
                    </button>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a className="dropdown-item" onClick = {handleRemove}>Remove</a>
                        <a className="dropdown-item" href="#">Another action</a>
                        <a className="dropdown-item" href="#">Something else here</a>
                    </div>
                </div>
        </div>
      </div>
      </div>
      );
}

export default MessageHeader;

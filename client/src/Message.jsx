import React from "react";


function Message(props){
  let wrapper = "";
  if(props.sent){
    wrapper = "wrapper-r";

  }
  else{
    wrapper = "wrapper-l";
  }

  return (
    <div className = {wrapper}>
    <div>
      <p className = "message-text">{props.message}</p>
    </div>
    </div>

  );
}

export default Message;

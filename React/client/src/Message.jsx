import React from "react";
import {fromBase64} from './helper.js';
import ImagePopup from './ImagePopup';

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
      {props.images.length != 0 ? props.images.map((data) => {
        let image = fromBase64(data);
        console.log("Rendering");
        return <img onClick = {(e) => {
          console.log("Clicking Image")
          e.stopPropagation();
          props.showPopup({visible:true, image:image})}} className = "message-image" src = {image.src} />
      }) : null}

      { props.message.length != 0 ? <p className = "message-text">{props.message}</p> : null}
      
    </div>
    </div>

  );
}

export default Message;

import React from "react";
import {fromBase64} from './helper.js';
import ImagePopup from './ImagePopup';

function Message(props){
  let wrapper = "";
  let message_css = ""
  let image_css = ""
  if(props.sent){
    wrapper = "wrapper-r";
    message_css = "message-text-r"
    image_css = "message-image-r"
  }
  else{
    wrapper = "wrapper-l";
    message_css = "message-text-l"
    image_css = "message-image-l"
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
          props.showPopup({visible:true, image:image})}} className = {image_css} src = {image.src} />
      }) : null}

      { props.message.length != 0 ? <p className = {message_css}>{props.message}</p> : null}
      
    </div>
    </div>

  );
}

export default Message;

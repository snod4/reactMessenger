import React, {useState, useEffect} from "react";
import Input from "./Input";
import Message from "./Message";
import WebSocket from "isomorphic-ws";
import {fromBase64} from './helper.js';
import ImagePopup from './ImagePopup';


function ChatView(props){
const NOTIFY = true;
const NOT_NOTIFY = false;
const ws = props.ws;
let canPlay = false;
const notificationSound = new Audio("./notificationSound.mp3");
notificationSound.addEventListener("canplaythrough", event => {
/* the audio is now playable; Play it if permissions allow */
canPlay = true;
});
  const [messages, setMessages] = useState([]);
  const [popup, setPopup] = useState({
    visible:false,
    image: null
  })
  function handlePopupClick(event){
    event.stopPropagation();
    const modal = document.querySelector(".popup-visible");
    if(modal !== null && event.target !== modal){
      console.log("Got to window click");
      setPopup({visible: false, image:null});
    }
  }
  useEffect(() => {
    console.log(`popup useEffect`)
    if(popup.visible){
      console.log("Adding listner")
      window.addEventListener("click", handlePopupClick)
    }
    else{
      console.log("Removing event listener")
      window.removeEventListener("click", handlePopupClick)
    }
  }, [popup, handlePopupClick])

  useEffect(()=>{
    console.log("Got use useEffect")
    if(props.recipientId === -1){
      return;
    }
    console.log(`Got to chat fetch, recipeintId: ${props.recipientId}, name: ${props.name}`)
      fetch(process.env.REACT_APP_API_URL + "/chat", {

        // Adding method type
        method: "POST",

        // Adding body or contents to send
        body: JSON.stringify({convoId: props.convoId, recipientId: props.recipientId, senderId: props.senderId, recipientName: props.name}),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then(response => response.json())
      .then(responseJSON => {
        //console.log(`Data: ${responseJSON.data}, typeof: ${typeof responseJSON.data}`)
        //console.log(responseJSON.data)
        // let currentItem;
        // for(let i = 0; i < responseJSON.data.length; i++){
        //   currentItem = responseJSON.data[i];
        //   if(currentItem.images.length != 0){
        //     for(let g = 0; g < currentItem.images.length; g++){
        //       console.log("JSON STRING: " + JSON.stringify(currentItem.images[g]))
        //       currentItem.images[g] = fromBase64(currentItem.images[g]);
        //       console.log("Chatview Image Src: " + currentItem.images[g]);
        //     }
        //   }
        // }
        setMessages(responseJSON.data);
      });

  }, [props.convoId, props.name, props.recipientId, props.senderId]);

  function notifySound(){
    if(canPlay){
      notificationSound.play();
    }
  }

 ws.onmessage = message => {
   console.log("RECIEVED MESSAGE FROM SERVER")
   console.log(message)
   const messageJson = JSON.parse(message.data);

  //  if(messageJson.images.length != 0){
  //    messageJson.images = messageJson.images.map(fromBase64);
  //  }

   console.log(messageJson)
   if(messageJson.senderId === props.recipientId){
     notifySound();
     props.updateContent(messageJson.senderId, ((messageJson.message !== null && messageJson.message.length !== 0) ? messageJson.message : "Sent a photo"), messageJson.senderName, messageJson.convoId, NOT_NOTIFY);
     setMessages([...messages, {id:messageJson.recipientId, message: messageJson.message, images: messageJson.images}]);
   }
   else{
     notifySound();
     console.log("Hewre")
     props.updateContent(messageJson.senderId, ((messageJson.message !== null && messageJson.message.length !== 0) ? messageJson.message : "Sent a photo"), messageJson.senderName, messageJson.convoId, NOTIFY);
   }
 };

  console.log(`messages:`);
  console.log(messages)
  console.log(ws) 


  function addUserMessage(message, images){
    if(message === "" && images.length == 0){
      return;
    }
  
    setMessages(prevMessages => {
      prevMessages.push({
        id:props.senderId,
        message: message,
        images: images
      });
      console.log("ChatView WS:");
      console.log(ws);
      ws.send(JSON.stringify({
        recipientId:props.recipientId,
        message: message,
        images: images
      }));

      props.updateContent(props.recipientId, (message != null && message.length != 0 ? message : "Sent a photo") , "", props.convoId, NOT_NOTIFY);


      return [...prevMessages];
    });
  }






return (
  <div className = "messageWindow"> 
  <ImagePopup visible = {popup.visible} image = {popup.image} />
  <table className={"chatTable " + (popup.visible? "hide" : "")}>
    <tbody>
            <tr className = "name-plate">
                <td valign="top"><h1>{props.recipientId !== -1 ? props.name: "Pick someone"}</h1></td>
            </tr>
            <tr>
              <td valign = "middle" style = {{height:"100%"}} >

              <div className = "message-text-section">
                {props.recipeintId !== -1 ? messages.map((item, index) => <Message key = {index} showPopup = {setPopup} message = {item.message} images = {item.images} sent = {item.id === props.senderId} />) : "Start Chatting Here"}
                </div>
              </td>
            </tr>
            <tr>
                <td valign="bottom">{ props.recipientId !== -1 ? <Input sendMessage = {addUserMessage}/> : null}</td>
            </tr>
        </tbody>
    </table>

    </div>
        
);
}

export default ChatView;

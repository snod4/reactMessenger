import React, {useState, useEffect} from "react";
import Input from "./Input";
import Message from "./Message";
import WebSocket from "isomorphic-ws";


function ChatView(props){
const NOTIFY = true;
const NOT_NOTIFY = false;
const ws = props.ws;
let canPlay = false;
const notificationSound = new Audio("./notificationSound.mp3");
notificationSound.addEventListener("canplaythrough", event => {
/* the audio is now playable; play it if permissions allow */
canPlay = true;
});
  const [messages, setMessages] = useState([]);
  console.log(`Typeof: ${typeof messages}`)
  //console.log(messages.map(()=>{return "Test"}))

  useEffect(()=>{
    console.log("Got use useEffect")
    if(props.recipientId === -1){
      return;
    }
    console.log(`Got to chat fetch, recipeintId: ${props.recipientId}, name: ${props.name}`)
      fetch("/chat", {

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
        console.log(`Data: ${responseJSON.data}, typeof: ${typeof responseJSON.data}`)
        console.log(responseJSON.data)
        setMessages(responseJSON.data)
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
   console.log(messageJson)
   if(messageJson.senderId === props.recipientId){
     notifySound();
     props.updateContent(messageJson.senderId, ((messageJson.message != null && messageJson.message.length != 0) ? messageJson.message : "Sent a photo"), messageJson.senderName, messageJson.convoId, NOT_NOTIFY);
     setMessages([...messages, {id:messageJson.recipientId, message: messageJson.message, images: messageJson.images}]);
   }
   else{
     notifySound();
     console.log("Hewre")
     props.updateContent(messageJson.senderId, ((messageJson.message != null && messageJson.message.length != 0) ? messageJson.message : "Sent a photo"), messageJson.senderName, messageJson.convoId, NOTIFY);
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

      ws.send(JSON.stringify({
        recipientId:props.recipientId,
        message: message,
        images: images
      }));

      props.updateContent(props.recipientId, (message != null && message.length != 0 ? message : "Sent a photo") , "", props.convoId, NOT_NOTIFY);


      return [...prevMessages];
    });
  }

      // POST request using fetch()
  //   fetch('/chat', {
  //
  //       // Adding method type
  //       method: "POST",
  //
  //       // Adding body or contents to send
  //       body: JSON.stringify(prevMessages),
  //
  //       // Adding headers to the request
  //       headers: {
  //           "Content-type": "application/json; charset=UTF-8"
  //       }
  //   })
  //
  //   // Converting to JSON
  //   .then(response => response.json())
  //
  //   // Displaying results to console
  //   .then(json => console.log(json));
  //
  //         return {...prevMessages};
  // });




return (
  <table className="messageWindow">
  <tbody>
            <tr className = "name-plate">
                <td valign="top"><h1>{props.recipientId !== -1 ? props.name: "Pick someone"}</h1></td>
            </tr>
            <tr>
              <td valign = "middle" style = {{height:"100%"}} >
              <div className = "message-text-section">
                {props.recipeintId !== -1 ? messages.map((item, index) => <Message key = {index} message = {item.message} sent = {item.id === props.senderId} />) : "Start Chatting Here"}
                </div>
              </td>
            </tr>
            <tr>
                <td valign="bottom">{ props.recipientId !== -1 ? <Input sendMessage = {addUserMessage}/> : null}</td>
            </tr>
            </tbody>
        </table>
);
}

export default ChatView;

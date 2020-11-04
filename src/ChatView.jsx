import React, {useState, useEffect} from "react";
import Input from "./Input";
import Message from "./Message";
import WebSocket from "isomorphic-ws";


function ChatView(props){

const ws = props.ws;

  const [messages, setMessages] = useState([]);
  console.log(`Typeof: ${typeof messages}`)
  //console.log(messages.map(()=>{return "Test"}))

  useEffect(()=>{
    console.log("Got use useEffect")
    if(props.recipientId === -1){
      return;
    }
    console.log(`Got to chat fetch, recipeintId: ${props.recipientId}`)
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

  }, [props.convoId, props.recipientId, props.senderId]);


  console.log(`messages:`);
  console.log(messages)


  function addUserMessage(message){
    if(message === ""){
      return;
    }

    setMessages(prevMessages => {
      prevMessages.push({
        id:props.senderId,
        message: message
      });

      ws.send(JSON.stringify({
        recipientId:props.recipientId,
        message: message
      }));

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
                <td valign="bottom">{<Input sendMessage = {addUserMessage}/>}</td>
            </tr>
            </tbody>
        </table>
);
}

export default ChatView;

import React, {useState, useEffect} from "react";
import Input from "./Input";
import Message from "./Message";
import WebSocket from "isomorphic-ws";


function ChatView(props){
const convoId = props.id;
const ws = props.ws;

  const [userMessages, setUserMessages] = useState({
    messages:[],
    name:"",
    _id:null
  });

  console.log(userMessages);

  useEffect(()=>{
    fetch(`/chat?id=${encodeURIComponent(convoId)}`)
     .then(response => response.json())
     .then(state => setUserMessages(state));
  }, [convoId]);


  console.log(userMessages);


  function addUserMessage(message){
    if(message === ""){
      return;
    }

    setUserMessages(prevMessages => {
      prevMessages.messages.push({
        name: true,
        message: message
      });

      ws.send(JSON.stringify({
        recipient: props.name,
        message: message
      }));

      return {...prevMessages};
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
                <td valign="top"><h1>{props.name}</h1></td>
            </tr>
            <tr>
              <td valign = "middle" style = {{height:"100%"}} >
              <div className = "message-text-section">
                {userMessages.messages.map((item, index) => <Message key = {index} message = {item.message} sent = {item.sent} />)}
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

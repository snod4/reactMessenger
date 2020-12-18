import React, {useState, useEffect, useLayoutEffect} from "react";
import Heading from "./Heading";
import Sidebar from "./Sidebar";
import ChatView from "./ChatView";
import WebSocket from "isomorphic-ws";
import Login from "./Login"



function App(props){

  function heartbeat() {
    clearTimeout(this.pingTimeout);

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this.pingTimeout = setTimeout(() => {
      this.terminate();
    }, 30000 + 1000);
  }
// useEffect(()=>{
//   fetch(`/?id=${encodeURIComponent(id)}`)
//    .then(response => response.json())
//    .then(state => setUserMessages(state));
// }, [props.id]);


  const [login, setLogin] = useState({...props.loginResults});
  const [ws, setWebSocket] = useState(()=>{
    if(login.isLoggedIn){
      const tempWs = new WebSocket('ws://localhost:8080');
       tempWs.onopen = function open() {
       tempWs.send(login.id);
       console.log(`loginId: ${login.id}`);
       // heartbeat();
       // tempWs.on('ping', heartbeat);
       // tempWs.on('close', function clear() {
       //          clearTimeout(this.pingTimeout);
       //        });
     };
     return tempWs;
    }
    return null;
  });
  // const [state, setState] = useState("Test");
  const [activeConvo, setConvo] = useState({
    name:"",
    convoId:-1,
    recipientId: -1
  });





 //  function handleSubmit(event) {
 //   event.preventDefault();
 //   console.log(state);
 //   fetch(`/api/greeting?name=${encodeURIComponent(state)}`)
 //     .then(response => response.json())
 //     .then(state => setState(state.greeting));
 // }
 //
 //
 // function handleChange(event){
 //   const value = event.target.value;
 //   setState(value);
 // }

 console.log("Connecting WebSocket")
 if(ws == null && login.isLoggedIn){
 const tempWs = new WebSocket('ws://localhost:8080');
  tempWs.onopen = function open() {
  tempWs.send(login.id);
  console.log(`loginId: ${login.id}`);
  // heartbeat();
  // tempWs.on('ping', heartbeat);
  // tempWs.on('close', function clear() {
  //          clearTimeout(this.pingTimeout);
  //        });
};
setWebSocket(tempWs);
}
 if(!login.isLoggedIn){
   return (
     <Login handleLogin = {login => {
       console.log("Login Handler:")
       console.log(login)
       setLogin({...login});
     }
     }/>
   );
 }
 else{

   function changeConvo(name, convoId, recipientId){
     setConvo({name:name, convoId: convoId, recipientId: recipientId});
   }

   function updateContent(senderId, message, senderName, convoId, notify){
     console.log(`Update Content notify: ${notify}`);
     setLogin(prev => {
       for(let i = 0; i < prev.convos.length; i++){
         if(prev.convos[i].recipientId === senderId){
           prev.convos[i].newMessage = notify;
           prev.convos[i].mostRecentMessage = {id:senderId, message:message};
           //Play sound
            return {...prev};
         }
       }

       //Adds new convo in case new user contacted client
       prev.convos.push({
         recipientId:senderId, //id of person a user is talking to
         convoId: convoId,
         recipientName:senderName,
         recipientPhoto:"",
         newMessage: notify,
         mostRecentMessage: {id:senderId, message:message}
        });
         return {...prev}

     })
   }
   /// FIGURE OUT HOW TO GET SIDEBAR INFO FROM SEVER AND FIGURE OUT ACTIVE CONVO ON INITIAL LOAD




  return (
    <div style = {{height:"inherit"}}>

    <Sidebar selectConverstation = {changeConvo} convoArr = {login.convos}/>
     <ChatView convoId = {activeConvo.convoId} recipientId = {activeConvo.recipientId} senderId = {login.id} ws = {ws} name = {activeConvo.name} updateContent = {updateContent} />
     </div>
  );
}

}

export default App;

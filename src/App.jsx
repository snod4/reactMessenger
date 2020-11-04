import React, {useState, useEffect} from "react";
import Heading from "./Heading";
import Sidebar from "./Sidebar";
import ChatView from "./ChatView";
import WebSocket from "isomorphic-ws";
import Login from "./Login"



function App(props){


// useEffect(()=>{
//   fetch(`/?id=${encodeURIComponent(id)}`)
//    .then(response => response.json())
//    .then(state => setUserMessages(state));
// }, [props.id]);


  const [login, setLogin] = useState({...props.loginResults});
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
 if(!login.isLoggedIn){
   return (
     <Login handleLogin = {login => {
       setLogin({...login});
     }}/>
   );
 }
 else{

   function changeConvo(name, convoId, recipientId){
     setConvo({name:name, convoId: convoId, recipientId: recipientId});
   }
   /// FIGURE OUT HOW TO GET SIDEBAR INFO FROM SEVER AND FIGURE OUT ACTIVE CONVO ON INITIAL LOAD
   const ws = new WebSocket('ws://localhost:8080');

   ws.onopen = function open() {
   ws.send(login.id);
   console.log(`loginId: ${login.id}`)

   ws.onmessage = msg => {
     console.log(JSON.parse(msg.data));
     const messageJson = msg.data;


   }


 };

  return (
    <div style = {{height:"inherit"}}>

    <Sidebar selectConverstation = {changeConvo} convoArr = {login.convos}/>
     <ChatView convoId = {activeConvo.convoId} recipientId = {activeConvo.recipientId} senderId = {login.id} ws = {ws} name = {activeConvo.name} />
     </div>
  );
}

}

export default App;

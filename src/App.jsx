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


  const [login, setLogin] = useState({
    isLoggedIn:props.login,
    convoArr: [],
    id: -1
  });
  // const [state, setState] = useState("Test");
  const [activeConvo, setConvo] = useState({
    name:"",
    id:-1
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
     <Login handleLogin = {(isLogIn, convoArr, id) => {
       setLogin(prev => {
       return {
         isLoggedIn:isLogIn,
         convoArr:[...convoArr],
         id:id
       }
     })}}/>
   );
 }
 else{

   function changeConvo(name, id){
     setConvo({name:name, id: id});
   }
   /// FIGURE OUT HOW TO GET SIDEBAR INFO FROM SEVER AND FIGURE OUT ACTIVE CONVO ON INITIAL LOAD
   const ws = new WebSocket('ws://localhost:8080');

   ws.onopen = function open() {
   ws.send(login.id);

   ws.onmessage = msg => {
     console.log(JSON.parse(msg.data));
     const messageJson = msg.data;


   }


 };

  return (
    <div style = {{height:"inherit"}}>

    <Sidebar selectConverstation = {changeConvo} convoArr = {login.convoArr}/>
     <ChatView id = {activeConvo.id} ws = {ws} name = {activeConvo.name} />
     </div>
  );
}

}

export default App;

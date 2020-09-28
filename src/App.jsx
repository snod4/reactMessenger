import React, {useState} from "react";
import Heading from "./Heading";
import Sidebar from "./Sidebar";
import ChatView from "./ChatView";


function App(props){
  const [state, setState] = useState("Test");
  const [activeConvo, setConvo] = useState(-1);
  function changeConvo(id){
    setConvo(id);
  }
  function handleSubmit(event) {
   event.preventDefault();
   console.log(state);
   fetch(`/api/greeting?name=${encodeURIComponent(state)}`)
     .then(response => response.json())
     .then(state => setState(state.greeting));
 }

 function handleChange(event){
   const value = event.target.value;
   setState(value);
 }
  return (
    <div style = {{height:"inherit"}}>

    <Sidebar selectConverstation = {changeConvo}/>
     <ChatView id = {"5f6f97355d41305c4880debd"} />
     </div>
  );

}

export default App;

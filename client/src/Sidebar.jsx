import React, {useState} from "react";
import MessageHeader from "./MessageHeader";
import UserLookup from "./UserLookup";

function Sidebar(props){
let [convoArr, setConvoArr] = useState(props.convoArr);
console.log(convoArr);
//Add functionality to create basic conversations
function addToConvoArr(convo){
  for(let i = 0; i < convoArr.length; i++){
    if(convoArr[i].recipientId === convo.recipientId){
      return;
    }
  }
  setConvoArr([...convoArr, convo]);
}
console.log(`ConvoArr`)
console.log(convoArr)
  return (
    <div className = "sidebar">
        <UserLookup addToConvoArr = {addToConvoArr} />
        {convoArr.map((convo, key) => {
            return <MessageHeader
            key = {key}
            convoRef= {convo}
            notify = {convo.newMessage}
            convoId= {convo.convoId}
            recipientId = {convo.recipientId}
            selectConverstation = {props.selectConverstation}
            image = {convo.img}
            name = {convo.recipientName}
            content = {convo.mostRecentMessage}/>

        })}
      </div>

);
}

export default Sidebar;

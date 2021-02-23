import React, {useState} from "react";
import MessageHeader from "./MessageHeader";
import UserLookup from "./UserLookup";
import Account from "./Account"

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

function removeFromConvoArr(convo){
  for(let i = 0; i < convoArr.length; i++){
    if(convoArr[i].recipientId === convo.recipientId){
      convoArr.splice(i,1);
      break;
    }
  }
  setConvoArr([...convoArr]);
}
console.log(`ConvoArr`)
console.log(convoArr)
  return (
    <div className = "sidebar">
        <Account accountName = {props.name} logout = {props.logout}/>
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
            content = {convo.mostRecentMessage}
            removeFromConvoArr = {removeFromConvoArr}/>

        })}
      </div>

);
}

export default Sidebar;

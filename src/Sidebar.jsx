import React, {useState} from "react";
import MessageHeader from "./MessageHeader";
import UserLookup from "./UserLookup";

function Sidebar(props){
let [convoArr, setConvoArr] = useState(props.convoArr);
console.log(convoArr);
//Add functionality to create basic conversations

  return (
    <div className = "sidebar">
        <UserLookup addToConvoArr = {setConvoArr} />
        {convoArr.map((convo, key) => {
            return <MessageHeader
            key = {key}
            convoId= {convo.convoId}
            recipientId = {convo.recipientId}
            selectConverstation = {props.selectConverstation}
            image = {convo.img}
            name = {convo.recipientName}
            content = "This is a test to see how long this can be before breaking"/>

        })}
      </div>

);
}

export default Sidebar;

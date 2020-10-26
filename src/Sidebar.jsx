import React, {useState} from "react";
import MessageHeader from "./MessageHeader";
import UserLookup from "./UserLookup";

function Sidebar(props){
let [convoArr, setConvoArr] = useState(props.convoArr);
//Add functionality to create basic conversations

  return (
    <div className = "sidebar">
        <UserLookup addToConvoArr = {setConvoArr} />
        {convoArr.map(convo => {
            return <MessageHeader
            selectConverstation = {props.selectConversation}
            image = {convo.image}
             name = {convo.name}
             content = "This is a test to see how long this can be before breaking"/>

        })}
      </div>

);
}

export default Sidebar;

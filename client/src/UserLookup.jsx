import React, {useState, useEffect} from "react";
import AddIcon from '@material-ui/icons/Add';

function UserLookup(props){
  const [value, setValue] = useState("");
  const [displayItems, setDisplayItems] = useState({
    show:false,
    items:[]
  });

  function updateInput(event){
    const currentVal = event.target.value;
    setValue(currentVal);
   }

   useEffect(() => {
     if(value === ""){
       setDisplayItems({
         show:false,
         items: []})
       return;
     }
     fetch("/userLookup", {

       // Adding method type
       method: "POST",

       // Adding body or contents to send
       body: JSON.stringify({name: value}),

       // Adding headers to the request
       headers: {
           "Content-type": "application/json; charset=UTF-8"
       }
     })
     .then(response => response.json())
     .then(docs => {
       console.log(docs);
       setDisplayItems({
         show:true,
         items: docs});
     })}, [value]);



  return (
    <div className = "add-convo">


            <input onChange = {updateInput} onFocus = {() => setDisplayItems(prev => {return {show: true, items: prev.items}})} onBlur = {() => setDisplayItems( prev => {return {show: true, items: prev.items}})}type= "text" placeholder = "Name" value = {value}/ >
            {displayItems.show ? <div className = "search-results">{displayItems.items.map((item, key) =>{
              return <div onClick = {() => {
                setDisplayItems(prev => {return {...prev, show:false}});
                console.log(`Item.realName: ${item.realName}`)
                props.addToConvoArr({
                  recipientName: item.realName,
                   convoId: null,
                   recipientId: item._id,
                   recipientPhoto:"",
                   notify: false,
                   mostRecentMessage: null

                  });
                  }}>
                  {item.realName}
                   </div>})}
                  </div>
                  :null}





    </div>
  );
}

export default UserLookup;

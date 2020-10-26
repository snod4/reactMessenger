import React, {useState, useEffect} from "react";
import AddIcon from '@material-ui/icons/Add';

function UserLookup(props){
  const [value, setInput] = useState("");
  const [displayItems, setDisplayItems] = useState({
    show:false,
    items:[]
  });

  function updateInput(event){
    const currentVal = event.target.value;
    setInput(currentVal);
   }
   useEffect(() => {
     if(value === ""){
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
       setDisplayItems({
         show:displayItems.show,
         items: docs});
     })}, [value]);

      function handleClick(){}


  return (
    <div className = "add-convo">
      <div className = "container">
        <div className = "row">
          <div className = "col-9">
            <input onChange = {updateInput} onFocus = {() => setDisplayItems(prev => {return {show: true, items: prev.items}})} onBlur = {() => setDisplayItems( prev => {return {show: false, items: prev.items}})}type= "text" placeholder = "Name" value = {value}/ >
            {displayItems.show ? <ul>{displayItems.items.map((item) =>{return <li>{item.name}</li>})}</ul>:null}
          </div>
          <div className = "col-3">
            <button className = "btn btn-light" onClick = {handleClick}>{<AddIcon/>}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLookup;

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

      function handleClick(){}


  return (
    <div className = "add-convo">
      <div className = "container">
        <div className = "row">
          <div className = "col-9">
            <input onChange = {updateInput} onFocus = {() => setDisplayItems(prev => {return {show: true, items: prev.items}})} onBlur = {() => setDisplayItems( prev => {return {show: true, items: prev.items}})}type= "text" placeholder = "Name" value = {value}/ >
            {displayItems.show ? <div className = "search-results">{displayItems.items.map((item, key) =>{
              return <div onClick = {() => {
                setDisplayItems(prev => {return {...prev, show:false}})
                props.addToConvoArr(prev => {prev.push({
                  name: item.realName, convoId: null, recipientId: item._id});
                  return[...prev];})}}>
                  {item.realName}
                   </div>})}
                  </div>
                  :null}
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

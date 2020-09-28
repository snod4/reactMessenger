import React, {useState} from "react";


function Input(props){

  const [message, setMessage] = useState("");
  function updateMessage(event){

    setMessage(event.target.value);
  }

  function handleClick(){
    props.sendMessage(message);
    setMessage("");
  }
  return (

    <div className ="messages">
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text">$</span>
      </div>
      <textarea type="text" rows = "1" className="form-control" aria-label="Amount (to the nearest dollar)" onChange = {updateMessage} value = {message}/>
      <div className="input-group-append">
        <span className="input-group-text" onClick = {handleClick}>Send</span>
      </div>
    </div>
    </div>
  );
}

export default Input;

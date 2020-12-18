import React, {useState} from "react";
const fileTypes = [
  "image/jpg",
  "image/gif",
  "image/jpeg",
  "image/png",

];

function Input(props){

  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("hidden");
  function updateMessage(event){

    setMessage(event.target.value);
  }

  function handleClick(event){

    props.sendMessage(message);
    setMessage("");
  }

  function handleEnter(event){
    console.log("Got to enter")
    if(event.keyCode === 13){
      props.sendMessage(message);
      setMessage("");
    }
  }

 //handles image selection and its thumbnail
  function handleImageSelection(e){
    const preview = document.querySelector(".preview");
    while(preview.firstChild){
      preview.removeChild(preview.firstChild);
    }

    const list = document.createElement("ol");
    preview.appendChild(list);

    const curFiles = e.target.files;
    for(const file of curFiles){
      const listItem = document.createElement("li");
      if(fileTypes.includes(file.type)){
        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);
        image.style.width = "60px";
        listItem.appendChild(image);
        list.appendChild(listItem);

      }
    }

  }
  return (

    <div className ="messages">
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text" onClick = {() => {setVisibility('visible')}}>
          {visibility === 'hidden' ? "+":""}
          <div visibility = {visibility}>
            <input className = "file_input" type = "file" multiple = "true" onChange = {handleImageSelection}/>
            <div  className = "preview"></div>
            <button onClick = {()=>{
              const preview = document.querySelector(".preview");
              while(preview.firstChild){
                preview.removeChild(preview.firstChild);
              }
              const input = document.querySelector(".file_input");
              input.value = "";
              input.files = null;

            }}
            type="button" class="btn btn-danger">Cancel</button>
          </div>
          </span>
      </div>
      <textarea type="text" rows = "1" className="form-control" aria-label="Amount (to the nearest dollar)" onChange = {updateMessage} value = {message} onKeyUp = {handleEnter}/>
      <div className="input-group-append">
        <span className="input-group-text" onClick = {handleClick} >Send</span>
      </div>
    </div>
    </div>
  );
}

export default Input;

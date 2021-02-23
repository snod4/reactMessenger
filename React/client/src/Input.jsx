import React, {useState} from "react";
import {toBase64} from './helper.js';
const fileTypes = [
  "image/jpg",
  "image/gif",
  "image/jpeg",
  "image/png",

];

function Input(props){

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState({display:"none"})

  
  function updateMessage(event){
    setText(event.target.value);
  }

  function handleClick(event){
      console.log("Handle click");
      const preview = document.querySelector(".preview");
      while(preview.firstChild){
        preview.removeChild(preview.firstChild);
      }
      const input = document.querySelector(".file_input");
      input.value = "";
      input.files = null;

    
    props.sendMessage(text, images);
    setText("");
    setImages([]);
  }

  function handleEnter(event){
    console.log("Got to enter")
    if(event.keyCode === 13){
      handleClick(event);
    }
  }

 //handles image selection and its thumbnail
  //thx stack overflow


  async function handleImageSelection(e){
    console.log("handleImageSelection")
    const preview = document.querySelector(".preview");
    while(preview.firstChild){
      preview.removeChild(preview.firstChild);
    }

    const list = document.createElement("ol");
    preview.appendChild(list);

    const curFiles = e.target.files;
    let imgArray = [];
    console.log(`Length: ${curFiles.length}`);
   
    for(const file of curFiles){
      imgArray.push(
        await toBase64(file)
      );
      const listItem = document.createElement("li");
      if(fileTypes.includes(file.type)){

        console.log("loop");

        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);
        image.style.width = "60px";
        listItem.appendChild(image);
        list.appendChild(listItem);

      }
    }

    setImages(imgArray);

    

  }

  
  return (

    <div className ="messages">
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text" >
          {visibility.display === 'none' ? <div onClick = {() => {setVisibility({display:"block"})}}>+</div>:""}
          <div style = {visibility}>
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
              setImages([]);
              setVisibility({display:"none"});

            }}
            type="button" className="btn btn-danger">Cancel</button>
          </div>
        </span>
      </div>
      <textarea type="text" rows = "1" className="form-control" aria-label="Amount (to the nearest dollar)" onChange = {updateMessage} value = {text} onKeyUp = {handleEnter}></textarea>
      <div className="input-group-append">
        <span className="input-group-text" onClick = {handleClick} >Send</span>
      </div>
    </div>
    </div>
  );
}

export default Input;

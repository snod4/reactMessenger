import React, {useState} from "react";
const fileTypes = [
  "image/jpg",
  "image/gif",
  "image/jpeg",
  "image/png",

];

function Input(props){

  const [message, setMessage] = useState({
    text: "",
    images: []
  });
  const [visibility, setVisibility] = useState("hidden");
  console.log("here:" + message.text);
  function updateMessage(event){
    console.log(message.text);

    setMessage(prev => {
      console.log("Update")
      prev.text = prev.text + event.target.value;
      console.log(prev)
      return prev;
      });
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

    
    props.sendMessage(message.text, message.images);
    setMessage({message: "", images: []});
  }

  function handleEnter(event){
    console.log("Got to enter")
    if(event.keyCode === 13){
      handleClick(event);
    }
  }

 //handles image selection and its thumbnail
  //thx stack overflow
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    console.log("Converting");
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

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
      imgArray.push({
        data:await toBase64(file)
      });
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

    setMessage(prev => {
      prev.images = imgArray;
      return prev;
    });

    

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
              setMessage(prev => {
                prev.images = [];
                return prev;
              });

            }}
            type="button" className="btn btn-danger">Cancel</button>
          </div>
          </span>
      </div>
      <textarea type="text" rows = "1" className="form-control" aria-label="Amount (to the nearest dollar)" onChange = {updateMessage} value = {message.text} onKeyUp = {handleEnter}/>
      <div className="input-group-append">
        <span className="input-group-text" onClick = {handleClick} >Send</span>
      </div>
    </div>
    </div>
  );
}

export default Input;

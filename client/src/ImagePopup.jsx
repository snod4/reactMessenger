import React, { useEffect } from "react";



function ImagePopup(props){
    
    let visible;
    if(props.visible){
        visible = "popup-visible";
    }
    else{
        visible = "popup-hidden";
    }
    
    return <div className = {visible + " center"} >
        <img className = "popup-image" src = {props.image !== null ? props.image.src : ""} />
    </div>
}

export default ImagePopup;
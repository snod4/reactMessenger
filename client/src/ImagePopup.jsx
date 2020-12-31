import React, { useEffect } from "react";



function ImagePopup(props){
    
    let visible;
    let aspectRatio;
    if(props.visible){
        visible = "popup-visible";
        if(props.image.width > props.image.height){
            aspectRatio = "popup-wide"
            console.log(`Image width: ${props.image.width}, Image height: ${props.image.height}`);
        }
        else{
            aspectRatio = "popup-tall";
            console.log(`Image width: ${props.image.width}, Image height: ${props.image.height}`);

        }
    }
    else{
        visible = "popup-hidden";
    }
    
    return <div className = {visible + " center"} >
        <img className = {aspectRatio} src = {props.image !== null ? props.image.src : ""} />
    </div>
}

export default ImagePopup;
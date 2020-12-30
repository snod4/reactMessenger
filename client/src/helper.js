
  //converts images to base64 for sending thru websockets
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    console.log("Converting");
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  //converts images from base64 to an image to be displayed
function fromBase64(data){
    var image = new Image();
    image.src = data;
    return image;
}
  module.exports = {
      toBase64, 
      fromBase64
  };
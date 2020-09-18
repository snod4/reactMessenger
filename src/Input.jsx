import React from "react";


function Input(
){

  return (
    <React.Fragment>
    <div className ="messages">a</div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="text" class="form-control" aria-label="Amount (to the nearest dollar)"/>
      <div class="input-group-append">
        <span class="input-group-text">.00</span>
      </div>
    </div>
    </React.Fragment>
  );
}

export default Input;

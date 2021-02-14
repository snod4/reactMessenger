import React from "react";

function Account(props){


    return (
        <div className = "containter account-div">
            <div className = "row ">
                <div className = "account-name col-7 "><h3>{props.accountName}</h3></div>
                <div class="col-5 align-self-center dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Options
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" onClick = {props.logout}>Log out</a>
                        <a class="dropdown-item" href="#">Another action</a>
                        <a class="dropdown-item" href="#">Something else here</a>
                    </div>
                </div>            
            </div>

        </div>
    );
}

export default Account;
import React from "react";

function Account(props){


    return (
        <div className = "containter account-div">
            <div className = "row ">
                <div className = "account-name col-7 "><h3>{props.accountName}</h3></div>
                <div className="account-options align-self-center col-5 dropdown  ">
                    <button className="btn shadow-none dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Options
                    </button>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a className="dropdown-item" onClick = {props.logout}>Log out</a>
                        <a className="dropdown-item" href="#">Another action</a>
                        <a className="dropdown-item" href="#">Something else here</a>
                    </div>
                </div>            
            </div>

        </div>
    );
}

export default Account;
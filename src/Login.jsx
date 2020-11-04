import React, {useState} from "react";


function Login(props){
  const [loginInfo,setLogin] = useState({
    register: false,
    user: "",
    password: "",
    name:""
  })
  function updateUser(event){
    loginInfo.user = event.target.value;
    setLogin(prevLogin => {return {...prevLogin}});
  }
  function updatePassword(event){
    loginInfo.password = event.target.value;
    setLogin(prevLogin => {return {...prevLogin}});
  }
  function updateName(event){
    loginInfo.name = event.target.value;
    setLogin(prevLogin => {return {...prevLogin}});
  }
  function handleRegister(e){
    e.preventDefault();
    fetch("/register", {

        // Adding method type
        method: "POST",

        // Adding body or contents to send
        body: JSON.stringify(loginInfo),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }

    })
    .then(response => response.json())
    .then(login => {
      console.log("Login:");
      console.log(login);
      console.log("END");
      props.handleLogin(login);
    });
  }
  function handleLogin(e){
    e.preventDefault();
    fetch("/login", {

        // Adding method type
        method: "POST",

        // Adding body or contents to send
        body: JSON.stringify(loginInfo),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }

    })
    .then(response => response.json())
    .then(login => {
      console.log("Login:");
      console.log(login);
      console.log("END");
      props.handleLogin(login.login, login.convos, login.id);

    });
  }
  console.log("Register: " + loginInfo.register);
  return (
    <div className = "text-center body-sign-in">
      <form className="form-signin">
      <img className="mb-4" src="/docs/4.5/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72"/>
      <h1 className="h3 mb-3 font-weight-normal">{loginInfo.register ? "Register" : "Please Sign In"}</h1>
      {loginInfo.register ? <div>
        <label htmlFor="inputName" className="sr-only">Name</label>
        <input type="text" id="inputName" className="form-control" placeholder="Name" required="" autoFocus="" onChange = {updateName} value = {loginInfo.name}/></div>:null}
      <label htmlFor="inputEmail" className="sr-only">Email address</label>
      <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required="" autoFocus="" onChange = {updateUser} value = {loginInfo.user}/>
      <label htmlFor="inputPassword" className="sr-only">Password</label>
      <input type="password" id="inputPassword" className="form-control" placeholder="Password" required=""  onChange = {updatePassword} value = {loginInfo.password}/>
      <div className="checkbox mb-3">
        <label>
          <input type="checkbox" value="remember-me"/>
        </label>
      </div>
      <button className="btn btn-lg btn-primary btn-block" type="submit" onClick = {loginInfo.register ? handleRegister : handleLogin}>{loginInfo.register ? "Register" : "Sign In"}</button>
      {!loginInfo.register ? <button className="btn btn-lg btn-primary btn-block" type="submit"
      onClick = {() => {setLogin(prevLogin => {
        prevLogin.register = true;
        return {...prevLogin};
      })}}>Register</button>
  : null}
      <p className="mt-5 mb-3 text-muted">© 2017-2020</p>
      </form>
      </div>

  );
}

export default Login;

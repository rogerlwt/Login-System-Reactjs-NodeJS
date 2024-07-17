import axios from "axios"
import React, { useState } from "react";

const axios_post=axios.create({
    withCredentials: true,
});

let user={name: "Guest", id: 0};

try{
    await axios_post.post("http://localhost:8080/get_cookie")
    .then(res=>{
        if (res.data!="Invalid"){
            user=res.data;
        }
    })
}
catch(err){
    console.log(err);
}

function Login(){
    const [name, setName]=useState({});
    const [password, setPassword]=useState({});
    
    async function submit(e){
        e.preventDefault();

        try{
            //let name=document.getElementById("login_name").value;
            //let password=document.getElementById("login_password").value;
            await axios_post.post("http://localhost:8080/login", {
                name, password
            })
            .then(res=>{
                console.log(res);
                if(res.data===false){
                    alert("Login Fail");
                    document.getElementById("login_form").reset();
                }
                else if(res.data===true){
                    window.location="/";
                }
                else{
                    alert("Error")
                }
            })
            .catch(err=>{
                console.log(err);
            })
        }
        catch(err){
            console.log(err);
        }
    }

    let userinfo_path="/".concat(user.id);
    return (
        <div className="login">
            <h1>Login Page</h1>

            <form id="login_form" action="POST">
                <input type="text" id="login_name" placeholder="Name" onChange={(e)=>{setName(e.target.value)}} /><br />
                <input type="password" id="login_password" placeholder="Password" onChange={(e)=>{setPassword(e.target.value)}} /><br />
                <input type="submit" onClick={submit}/><br />
            </form>

            <br />
            <p>OR</p>
            
            <a href="/">Home Page</a><br />
            <a href="/login">Login Page</a><br />
            <a href="/signup">Signup Page</a><br />
            <a href={userinfo_path}>User Info page (Logout & Change Password)</a><br />
            <a href="/userlist">User List (Need Admin Account)</a><br />
        </div>
    )
}

export default Login;
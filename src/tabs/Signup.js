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

function Signup(){
    const [name, setName]=useState({});
    const [password, setPassword]=useState({});

    async function submit(e){
        e.preventDefault();
        try{
            //let name=document.getElementById("signup_name").value;
            //let password=document.getElementById("signup_password").value;
            await axios_post.post("http://localhost:8080/signup", {
                name, password
            })
            .then(res=>{
                console.log(res);
                if(res.data==false){
                    alert("User already exist");
                    document.getElementById("signup_form").reset();
                }
                else if(res.data==true){
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
        <div className="signup">
            <h1>SignUp Page</h1>

            <form id="signup_form" action="POST">
                <input type="text" id="signup_name" placeholder="Name" onChange={(e)=>{setName(e.target.value)}}/><br />
                <input type="password" id="signup_password" placeholder="Password" onChange={(e)=>{setPassword(e.target.value)}}/><br />
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

export default Signup;
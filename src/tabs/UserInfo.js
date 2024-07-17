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

let status="Status: ";
if("/".concat(user.id)!=window.location.pathname){
    status+="Invalid";
}
else{
    status+="Valid";
}

function UserInfo(){
    const [curr_password, setCurrPW]=useState({});
    const [new_password, setNewPW]=useState({});

    async function submit_change_password(e){
        e.preventDefault();

        try{
            await axios_post.post("http://localhost:8080/change_password", {
                curr_password, new_password
            })
            .then(res=>{
                console.log(res);
                if(res.data===false){
                    alert("Change Fail");
                    document.getElementById("change_password").reset();
                }
                else if(res.data===true){
                    alert("Change Success");
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

    async function submit_logout(e){
        e.preventDefault();

        try{
            await axios_post.post("http://localhost:8080/logout")
            .then(res=>{
                console.log(res);
                if(res.data===false){
                    alert("Logout Fail");
                }
                else if(res.data===true){
                    alert("Logout Success");
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
        <div id="UserInfo">
            <h1>User Info</h1>
            <h2>Hi {user.name}, You can change password or logout here.</h2>
            <pre>{status}</pre>

            <h3>Change Password?</h3>
            <form id="change_password" action="POST">
                <input type="password" id="curr_password" placeholder="Current Password" onChange={(e)=>{setCurrPW(e.target.value)}}/><br />
                <input type="password" id="new_password" placeholder="New Password" onChange={(e)=>{setNewPW(e.target.value)}}/><br />
                <input type="submit" onClick={submit_change_password}/><br />
            </form>

            <h3>Logout?</h3>
            <input type="submit" onClick={submit_logout} />
            
            <p>OR</p>

            <a href="/">Home Page</a><br />
            <a href="/login">Login Page</a><br />
            <a href="/signup">Signup Page</a><br />
            <a href={userinfo_path}>User Info page (Logout & Change Password)</a><br />
            <a href="/userlist">User List (Need Admin Account)</a><br />
        </div>
    )
}

export default UserInfo;
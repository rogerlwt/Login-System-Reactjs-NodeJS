import axios from "axios"
import React from "react";

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

let content="";
try{
    await axios_post.post("http://localhost:8080/userlist")
    .then(res=>{
        if (res.data=="Invalid"){
            content="You do not have permission to access.\nPlease login with Admin account."
        }
        else{
            for(let i=0; i<(res.data).length; i++){
                content+="User ID: "+res.data[i].user_id+"\n"+"User Name: "+res.data[i].user_name+"\n"+"Salt: "+res.data[i].salt+"\n"+"Salted Password: "+res.data[i].salted_password+"\n\n";
            }
        }
    })
    .catch(err=>{
        console.log(err);
    })
}
catch(err){
    console.log(err);
}


function UserList(){

    let userinfo_path="/".concat(user.id);
    return (
        <div id="UserList">
            <h1>User List</h1>
            <pre>{content}</pre>
            
            <p>OR</p>
            
            <a href="/">Home Page</a><br />
            <a href="/login">Login Page</a><br />
            <a href="/signup">Signup Page</a><br />
            <a href={userinfo_path}>User Info page (Logout & Change Password)</a><br />
            <a href="/userlist">User List (Need Admin Account)</a><br />
        </div>
    )
}

export default UserList;
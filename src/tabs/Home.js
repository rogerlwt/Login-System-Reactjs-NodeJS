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


function Home(){
    let userinfo_path="/".concat(user.id);
    return (
        <div className="home">
            <h1>Hi {user.name}, this is the HOME page</h1>

            <a href="/">Home Page</a><br />
            <a href="/login">Login Page</a><br />
            <a href="/signup">Signup Page</a><br />
            <a href={userinfo_path}>User Info page (Logout & Change Password)</a><br />
            <a href="/userlist">User List (Need Admin Account)</a><br />
        </div>
    )
}

export default Home;
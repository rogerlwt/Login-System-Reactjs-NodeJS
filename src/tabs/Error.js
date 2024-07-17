import axios from "axios"
import React from "react";
import { useLocation } from "react-router-dom";

const axios_post=axios.create({
    withCredentials: true,
});

let user="Guest";
try{
    await axios_post.post("http://localhost:8080/get_cookie")
    .then(res=>{
        user=res.data;
    })
}
catch(err){
    console.log(err);
}

function Error(){
    return (
        <div className="home">
            <h1>Error</h1>
            <h2>There is no this page</h2>            

            <a href="/">Home Page</a><br />
            <a href="/login">Login Page</a><br />
            <a href="/signup">Signup Page</a><br />
        </div>
    )
}

export default Error;
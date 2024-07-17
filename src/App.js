import logo from './logo.svg';
import './App.css';

import Home from "./tabs/Home"
import Login from "./tabs/Login"
import Signup from "./tabs/Signup"
import UserList from "./tabs/UserList"
import UserInfo from "./tabs/UserInfo"
import Error from "./tabs/Error"

import {BrowserRouter, Routes, Route, useParams} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="" element={<Home />} />
            <Route path="userlist" element={<UserList />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </ Route>

          <Route path=":userid" element={<ValidateUser />} /> {/* Validate the path*/}

          <Route path="*" element={<Error/>}/> {/* Show the Error Page if the path is not exist*/}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function ValidateUser() {
  let params = useParams();

  //if the path is form from digits, return the user info page and allow users change password
  let userId = params.userid.match(/\d+/);
  if (userId){
    return <UserInfo />;
  }

  //if not, then return Error Page
  return <Error />;
}

export default App;

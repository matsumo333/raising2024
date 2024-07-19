import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Components/Home";
import MemberCreate from "./Components/MemberCreate";
import Navbar from "./Components/Navbar";
import Logout from "./Components/Logout";
import EmailLogin from "./Components/EmailLogin";
import ResetEmailPassword from "./Components/ResetEmailPassword";
import SignUpForm from "./Components/SignUpForm";
import CreatePost from "./Components/CreatePost";
import EventList from "./Components/EventList";
import EventSelect from "./Components/EventSelect";
import EventCreate from "./Components/EventCreate";
import EventForm from "./Components/EventForm";
import EventDetail from "./Components/EventDetail";
import EventEdit from "./Components/EventEdit";
import EventCancel from "./Components/EventCancel";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("isAuth"));
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const storedAccountName = localStorage.getItem("accountName");
    if (storedAccountName) {
      setAccountName(storedAccountName);
    }
  }, []);

  return (
    <Router>
      <Navbar isAuth={isAuth} accountName={accountName} />
      <Routes>
        <Route
          path="/login"
          element={
            <Login setIsAuth={setIsAuth} setAccountName={setAccountName} />
          }
        />
        <Route
          path="/emaillogin"
          element={<EmailLogin setIsAuth={setIsAuth} />}
        />
        <Route path="/logout" element={<Logout setIsAuth={setIsAuth} />} />
        <Route
          path="/signupform"
          element={<SignUpForm setIsAuth={setIsAuth} />}
        />
        <Route path="/member" element={<MemberCreate isAuth={isAuth} />} />
        <Route path="/createpost" element={<CreatePost isAuth={isAuth} />} />
        <Route path="/resetpassword" element={<ResetEmailPassword />} />
        <Route path="/" element={<Home setIsAuth={setIsAuth} />} />
        <Route path="/eventlist" element={<EventList isAuth={isAuth} />} />
        <Route path="/eventselect" element={<EventSelect isAuth={isAuth} />} />
        <Route
          path="/eventdetail/:id"
          element={<EventDetail isAuth={isAuth} />}
        />
        <Route path="/eventform" element={<EventForm isAuth={isAuth} />} />
        <Route path="/eventedit/:id" element={<EventEdit isAuth={isAuth} />} />
        <Route
          path="/eventcreate/:id"
          element={<EventCreate isAuth={isAuth} />}
        />
        <Route
          path="/eventcancel/:id"
          element={<EventCancel isAuth={isAuth} />}
        />
        <Route path="/" element={<Home setIsAuth={setIsAuth} />} />

        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;

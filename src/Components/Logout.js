import { signOut } from "firebase/auth";
import React from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Logout.scss";

const Logout = ({ setIsAuth, setUsername }) => {
  const navigate = useNavigate();
  const logout = () => {
    //ログアウト
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      // setUsername(false);
      navigate("/login");
    });
  };

  return (
    <>
      <div className="container">
        <div className="content">
          <p>ログアウト</p>
          <button className="logout-button" onClick={logout}>
            ログアウト
          </button>
        </div>
      </div>
    </>
  );
};

export default Logout;

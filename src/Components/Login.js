import React, { useState, useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase"; // Assuming db and auth are correctly initialized
import { useNavigate } from "react-router-dom";
import "./Login.scss";

const Login = ({ setIsAuth, setAccountName }) => {
  const navigate = useNavigate();

  const loginInWithGoogle = () => {
    // Googleでログイン
    signInWithPopup(auth, new GoogleAuthProvider())
      .then(async (result) => {
        localStorage.setItem("isAuth", true);
        setIsAuth(true);
        console.log(result);

        // Fetch account name and set it
        const user = result.user;
        const membersQuery = query(
          collection(db, "members"),
          where("author.id", "==", user.uid)
        );
        const membersSnapshot = await getDocs(membersQuery);

        if (!membersSnapshot.empty) {
          const userDoc = membersSnapshot.docs[0]; // Assuming there's only one matching document
          const userData = userDoc.data();
          const accountName = userData.accountname;
          setAccountName(accountName); // Set account name using useState
          localStorage.setItem("accountName", accountName); // Store account name in localStorage
        }

        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging in with Google: ", error);
      });
  };

  const handleEmailLogin = () => {
    navigate("/emaillogin");
  };

  const redirectToSignupForm = () => {
    navigate("/signupform");
  };

  return (
    <div className="container">
      <div className="content">
        <p>Googleアカウントでログイン</p>
        <button className="login-button" onClick={loginInWithGoogle}>
          Googleでログイン
        </button>
      </div>
      <div className="content">
        <p>メールアドレスでログイン</p>
        <button className="login-button" onClick={handleEmailLogin}>
          メールアドレスでログイン
        </button>
      </div>
      <div className="content">
        <p>新たに登録を実施</p>
        <button className="login-button" onClick={redirectToSignupForm}>
          新規登録
        </button>
      </div>
    </div>
  );
};

export default Login;

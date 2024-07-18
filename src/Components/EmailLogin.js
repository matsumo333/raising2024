import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "./EmailLogin.scss";
import { useNavigate } from "react-router-dom";

const EmailLogin = ({ setIsAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleEmailLogin = () => {
    navigate("/resetpassword");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // ログイン成功時の処理
      console.log("ログイン成功:");
      // console.log("ログイン成功:", userCredential.user);
      localStorage.setItem("isAuth", true);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          setError(
            "無効なメールアドレスです。正しいメールアドレスを入力してください。"
          );
          break;
        case "auth/user-disabled":
          setError("アカウントが無効です。管理者にお問い合わせください。");
          break;
        case "auth/user-not-found":
          setError("メールアドレスまたパスワードが間違っています。");
          break;
        case "auth/wrong-password":
          setError(
            "パスワードが間違っています。正しいパスワードを入力してください。"
          );
          break;
        default:
          setError("メールアドレスまたパスワードが間違っています。");
          break;
      }
      console.error("ログイン失敗:", error);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="content2">
          <div className="title">
            <p>メールアドレス</p>
          </div>
          <div className="close-button" onClick={() => navigate("/login")}>
            X
          </div>
        </div>
        <form className="content3" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />

          <p>パスワード</p>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />

          <button className="login-button" type="submit">
            ログイン
          </button>
        </form>
      </div>
      <div className="content">
        <button
          type="button"
          onClick={handleEmailLogin}
          className="login-button"
        >
          パスワードを忘れた
        </button>

        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default EmailLogin;

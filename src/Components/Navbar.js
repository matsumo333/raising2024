import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";

const Navbar = ({ isAuth, accountName }) => {
  const [menuActive, setMenuActive] = useState(false);
  const [currentAccountName, setCurrentAccountName] = useState(accountName);

  useEffect(() => {
    setCurrentAccountName(accountName);
  }, [accountName]);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  return (
    <nav className="navbar">
      <div className="circleName">ライジング</div>
      <div className="menu-icon" onClick={toggleMenu}>
        &#9776; {/* ハンバーガーアイコン */}
      </div>
      <ul className={`nav-links ${menuActive ? "active" : ""}`}>
        <li onClick={closeMenu}>
          <Link to="/">ホーム</Link>
        </li>
        <li onClick={closeMenu}>
          <Link to="/eventlist">日程</Link>
        </li>
        <li onClick={closeMenu}>
          <Link to="/eventselect">日程入力</Link>
        </li>
        <li onClick={closeMenu}>
          <Link to="/link">リンク</Link>
        </li>
        <li onClick={closeMenu}>
          <Link to="/member">メンバー登録</Link>
        </li>
        <li onClick={closeMenu}>
          <Link to="/memberlist">メンバー一覧</Link>
        </li>
        {/* <li onClick={closeMenu}>
          <Link to="/Slide1">スライド</Link>
        </li> */}
        {!isAuth ? (
          <li onClick={closeMenu}>
            <Link to="/login">ログイン</Link>
          </li>
        ) : (
          <>
            <li onClick={closeMenu}>
              <Link to="/createpost">投稿</Link>
            </li>
            <li onClick={closeMenu}>
              <a href="https://l--l.jp/gtlist/in.cgi?cd=sc2v4y2qdqq6">
                参加表明
              </a>
            </li>
            <li onClick={closeMenu}>
              <Link to="/logout">ログアウト</Link>
            </li>
            <li onClick={closeMenu}>
              <span>{currentAccountName}</span>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

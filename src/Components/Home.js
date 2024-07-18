import React, { useEffect, useState } from "react";
import "./Home.scss";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const Home = ({ isAuth }) => {
  const [postList, setPostList] = useState([]);
  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(collection(db, "posts"));
      // console.log(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      // console.log("y蔵よう",data.docs);
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getPosts();
  }, []);
  const handleDelete = async (id) => {
    console.log("きてtrue" + id);
    await deleteDoc(doc(db, "posts", id));
    window.location.href = "/";
  };
  return (
    <div className="homePage">
      {postList.map((post) => {
        return (
          <div className="postContents" key={post.id}>
            <div className="postHeader">
              <h1>{post.title}</h1>
            </div>
            <div className="postTextContainer">{post.postText}</div>
            <div className="nameAndDeleteButton">
              <h3>@{post.author.username}</h3>
              {post.author.id === auth.currentUser?.uid && (
                <button onClick={() => handleDelete(post.id)}>削除</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default Home;

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./EventForm.scss";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({});
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("isAuth") === "true"
  );

  useEffect(() => {
    const fetchData = async () => {
      // イベント一覧を取得
      const eventCollection = collection(db, "events");
      const eventSnapshot = await getDocs(eventCollection);
      const eventList = eventSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);

      // イベントメンバー一覧を取得
      const eventMembersCollection = collection(db, "event_members");
      const eventMembersSnapshot = await getDocs(eventMembersCollection);
      const eventMembersList = eventMembersSnapshot.docs.map((doc) =>
        doc.data()
      );
      setEventMembers(eventMembersList);

      // メンバー一覧を取得
      const membersCollection = collection(db, "members");
      const membersSnapshot = await getDocs(membersCollection);
      const membersList = membersSnapshot.docs.map((doc) => doc.data());
      setMembers(membersList);

      // ユーザー情報を取得
      const user = auth.currentUser;
      setCurrentUser(user);
      if (user) {
        const userId = user.uid;

        // ユーザーの参加イベント情報を取得

        // ユーザーがメンバーかどうかをチェック
        const filteredMembers = membersList.filter(
          (member) => member.author.id === userId
        );
        if (filteredMembers.length === 0) {
          alert(
            "あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。"
          );
          navigate("/member");
        }
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchParticipantCounts = () => {
      const counts = events.reduce((acc, event) => {
        const participants = eventMembers.filter(
          (member) => member.eventId === event.id
        );
        acc[event.id] = participants.length;
        return acc;
      }, {});
      setParticipantCounts(counts);
    };

    fetchParticipantCounts();
  }, [events, eventMembers]);

  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      console.log("User is not logged in");
      alert("ログインしてください");
      navigate("/login");
      return;
    }

    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      participants: arrayUnion(currentUser.uid),
    });

    // ユーザーのアカウント名を取得
    const user = members.find((member) => member.author.id === currentUser.uid);
    if (!user) {
      alert(
        "あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。"
      );
      navigate("/member");
      return;
    }
    const accountname = user.accountname;

    // イベントメンバーに新しいドキュメントを追加
    await addDoc(collection(db, "event_members"), {
      eventId: eventId,
      memberId: currentUser.uid,
      accountname: accountname, // accountname を追加
    });
    // ローカルのステートを更新
    setEventMembers((prevEventMembers) => [
      ...prevEventMembers,
      { eventId, memberId: currentUser.uid, accountname },
    ]);

    // Firestoreから最新のデータをフェッチ
    const eventMembersCollection = collection(db, "event_members");
    const eventMembersSnapshot = await getDocs(eventMembersCollection);
    const eventMembersList = eventMembersSnapshot.docs.map((doc) => doc.data());
    setEventMembers(eventMembersList);
  };

  return (
    <div className="container">
      {events.length === 0 ? (
        <>
          <button onClick={() => navigate("/eventform")}>新規日程入力</button>
        </>
      ) : (
        <>
          <h1>再利用可能なイベント一覧</h1>
          <table>
            <thead className="title">
              <tr>
                <th style={{ width: "150px" }} className="event_title">
                  開催日時
                </th>
                <th style={{ width: "200px" }} className="event_title">
                  タイトル
                </th>
                <th style={{ width: "150px" }} className="event_title">
                  開催場所
                </th>
                <th
                  style={{ width: "100px", marginBottom: "20px" }}
                  className="event_title"
                >
                  再利用する
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>
                    {format(event.starttime, "M /d（E）HH:mm ", {
                      locale: ja,
                    })}
                  </td>
                  <td>{event.title}</td>
                  <td>{event.site_region}</td>

                  <td className="table-cell">
                    <button
                      onClick={() => navigate(`/eventcreate/${event.id}`)}
                      style={{
                        fontSize: "18px",
                        padding: "1px 2px",
                        fontWeight: "bolder",
                      }}
                    >
                      再利用する
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default EventList;

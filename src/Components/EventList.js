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
import "./EventList.scss";
import { useNavigate } from "react-router-dom";
import { ParticipantList } from "./ParticipantList";
import { format, parseISO } from "date-fns";
import ja from "date-fns/locale/ja";
import { formatDuration } from "./utils";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [userEventParticipation, setUserEventParticipation] = useState({});
  const [participantCounts, setParticipantCounts] = useState({});
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("isAuth") === "true"
  );

  // 半角数字を全角数字に変換する関数
  const toFullWidth = (str) => {
    return str.replace(/[0-9]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
    });
  };

  // 継続時間を分に変換する関数
  const convertDurationToMinutes = (duration) => {
    if (!duration) {
      return 0; // durationが存在しない場合は0分を返す
    }
    const [hours, minutes] = duration.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // fetchData 関数を定義
  const fetchData = async () => {
    // イベント一覧を取得
    const eventCollection = collection(db, "events");
    const eventSnapshot = await getDocs(eventCollection);
    const eventList = eventSnapshot.docs.map((doc) => {
      const eventData = doc.data();
      const starttime = parseISO(eventData.starttime);
      const durationInMinutes = convertDurationToMinutes(eventData.duration);
      return {
        id: doc.id,
        ...eventData,
        starttime: starttime,
        duration: durationInMinutes,
      };
    });
    setEvents(eventList);

    // イベントメンバー一覧を取得
    const eventMembersCollection = collection(db, "event_members");
    const eventMembersSnapshot = await getDocs(eventMembersCollection);
    const eventMembersList = eventMembersSnapshot.docs.map((doc) => doc.data());
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
      const userEventMembers = eventMembersList.filter(
        (member) => member.memberId === userId
      );
      const userParticipation = userEventMembers.reduce((acc, member) => {
        acc[member.eventId] = true;
        return acc;
      }, {});
      setUserEventParticipation(userParticipation);

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

  useEffect(() => {
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

    // ユーザーの参加状況を更新
    setUserEventParticipation((prevParticipation) => ({
      ...prevParticipation,
      [eventId]: true,
    }));

    // Firestoreから最新のデータをフェッチ
    const eventMembersCollection = collection(db, "event_members");
    const eventMembersSnapshot = await getDocs(eventMembersCollection);
    const eventMembersList = eventMembersSnapshot.docs.map((doc) => doc.data());
    setEventMembers(eventMembersList);
  };

  const handleDelete = async (id) => {
    console.log("きてtrue" + id);
    await deleteDoc(doc(db, "events", id));
    // イベント削除後に最新のデータを再取得する
    fetchData();
    navigate("/eventlist");
  };

  return (
    <div className="eventListContainer">
      <h1>イベント一覧</h1>
      <table>
        <thead>
          <tr style={{ fontSize: "20px" }}>
            <th style={{ width: "200px" }} className="event_title">
              開催日
            </th>
            <th
              style={{ width: "80px" }}
              className="event_title hide-on-narrow"
            >
              開催時間
            </th>
            <th className="event_title">タイトル</th>
            <th className="event_title hide-on-narrow">開催場所</th>
            <th className="event_title hide-on-narrow">地図</th>
            <th className="event_title hide-on-narrow">面数</th>
            <th className="event_title hide-on-narrow">定員</th>
            <th className="event_title hide-on-narrow">申込人数</th>
            <th className="event_title hide-on-narrow">表面</th>
            <th className="event_title hide-on-narrow">コート番号</th>
            <th className="event_title hide-on-narrow">参加者</th>
            <th className="event_title">参加</th>
            <th className="event_title hide-on-narrow">削除</th>
            <th className="event_title hide-on-narrow">編集</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr
              style={{
                fontSize: "22px",
                fontWeight: "600",
              }}
              key={index}
            >
              <td
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                }}
              >
                {format(event.starttime, "M /d（E）HH:mm ", {
                  locale: ja,
                })}
              </td>
              <td
                className="hide-on-narrow"
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                }}
              >
                {formatDuration(event.duration)}
              </td>
              <td>
                <button
                  style={{
                    backgroundColor: "#1eb300",
                    fontSize: "20px",
                  }}
                  onClick={() => navigate(`/eventdetial/${event.id}`)}
                >
                  {event.title}
                </button>
              </td>
              <td className="hide-on-narrow">{event.site_region}</td>
              <td className="hide-on-narrow">{event.map}</td>
              <td className="hide-on-narrow">
                {event.court_count
                  ? toFullWidth(event.court_count.toString())
                  : "N/A"}
              </td>
              <td className="hide-on-narrow">
                {event.capacity
                  ? toFullWidth(event.capacity.toString())
                  : "N/A"}
              </td>
              <td className="hide-on-narrow">
                {participantCounts[event.id]
                  ? toFullWidth(participantCounts[event.id].toString())
                  : "0"}
              </td>
              <td className="hide-on-narrow">{event.court_surface}</td>
              <td className="hide-on-narrow">
                {event.court_num
                  ? toFullWidth(event.court_num.toString())
                  : "N/A"}
              </td>
              <td className="hide-on-narrow">
                <label htmlFor={`participants-${event.id}`}></label>
                <div className="participantList">
                  <ParticipantList
                    id={`participants-${event.id}`}
                    eventId={event.id}
                    eventMembers={eventMembers}
                    navigate={navigate}
                  />
                </div>
              </td>
              <td>
                {userEventParticipation[event.id] ? (
                  <button
                    className="button2"
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    参加
                  </button>
                ) : (
                  <button
                    className="button3"
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    未定
                  </button>
                )}
              </td>
              <td className="hide-on-narrow">
                <button
                  style={{
                    backgroundColor: "#fd9812",
                    fontSize: "20px",
                  }}
                  className="button3"
                  onClick={() => handleDelete(event.id)}
                >
                  削除
                </button>
              </td>
              <td className="hide-on-narrow">
                <button
                  style={{
                    backgroundColor: "#1eb300",
                    fontSize: "20px",
                  }}
                  onClick={() => navigate(`/eventedit/${event.id}`)}
                >
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventList;

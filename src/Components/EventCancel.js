import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import "./EventCancel.scss";

function EventCancel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    title: "",
    site: "",
    site_region: "",
    starttime: "",
    duration: "",
    deadline: "",
    court_surface: "",
    court_count: "",
    capacity: "",
    map: "",
    detail: "",
    password: "",
    rank: "",
    created_at: "",
    updated_at: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    const fetchAccountName = async (user) => {
      try {
        const eventMemberQuery = query(
          collection(db, "event_members"),
          where("eventId", "==", id),
          where("memberId", "==", user.uid)
        );
        const eventMemberSnapshot = await getDocs(eventMemberQuery);
        if (!eventMemberSnapshot.empty) {
          const eventMemberData = eventMemberSnapshot.docs[0].data();
          setAccountName(eventMemberData.accountname);
        }
      } catch (error) {
        console.error("Error fetching event member document:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchAccountName(user);
      }
    });

    fetchEventData();

    return unsubscribe;
  }, [id]);

  const handleRemoveParticipant = async () => {
    try {
      // 関連するevent_membersの削除
      const eventMemberQuery = query(
        collection(db, "event_members"),
        where("eventId", "==", id),
        where("memberId", "==", currentUser.uid)
      );
      const eventMemberSnapshot = await getDocs(eventMemberQuery);
      eventMemberSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      console.log("イベントからのユーザーの削除が正常に完了しました");
      navigate("/eventlist");
      // 再読み込みなどの処理を行うことができます
    } catch (error) {
      console.error(
        "イベントからのユーザーの削除中にエラーが発生しました:",
        error
      );
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h2>参加取消画面</h2>
        <div>
          <label>タイトル </label>
          <div className="event">{event.title}</div>
        </div>
        <div>
          <label>開始日時 </label>
          <div className="event">{event.starttime}</div>
        </div>
        <div>
          <label>終了日時 </label>
          <div className="event">{event.duration}</div>
        </div>
        <div>
          <label>参加上限人数 </label>
          <div className="event">{event.capacity}</div>
        </div>{" "}
        <div>
          <label>キャンセル申出者名</label>
          <div className="event">
            {currentUser ? currentUser.displayName : ""}
          </div>
        </div>
        <button onClick={handleRemoveParticipant}>イベントから削除</button>
      </div>
    </div>
  );
}

export default EventCancel;

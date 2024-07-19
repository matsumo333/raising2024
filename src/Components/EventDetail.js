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
import "./EventDetail.scss";
import { useNavigate, useParams } from "react-router-dom";
import { ParticipantList } from "./ParticipantList";
import { format, parseISO } from "date-fns";
import ja from "date-fns/locale/ja";
import { formatDuration } from "./utils";

const EventDetail = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [userEventParticipation, setUserEventParticipation] = useState({});
  const [participantCounts, setParticipantCounts] = useState({});
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    title: "",
    site: "",
    site_region: "",
    starttime_date: "",
    starttime_hour: "",
    starttime_minute: "",
    duration_hour: "",
    duration_minute: "",
    endtime: "",
    deadline_date: "",
    deadline_hour: "",
    deadline_minute: "",
    court_surface: "",
    court_count: "",
    court_num: "",
    capacity: "",
    map: "",
    detail: "",
    password: "",
    rank: "",
    created_at: "",
    updated_at: "",
  });

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
    try {
      // イベント一覧を取得
      const eventCollection = collection(db, "events");
      const eventSnapshot = await getDocs(eventCollection);
      const eventDetail = eventSnapshot.docs.map((doc) => {
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

      // イベントリストを設定
      setEvents(eventDetail);

      // 特定のイベントのみをフィルタリング
      const filteredEvents = eventDetail.filter((event) => event.id === id);
      if (filteredEvents.length > 0) {
        setEvent(filteredEvents[0]);
        // 最初のマッチするイベントを設定
      }

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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

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
    console.log("Deleting event with id:", id);
    await deleteDoc(doc(db, "events", id));
    // イベント削除後に最新のデータを再取得する
    fetchData();
    navigate("/eventlist");
  };

  const formatDateWithDayStyle = (dateString) => {
    const date = parseISO(dateString);
    const formattedDate = format(date, "yyyy年M月d日（E）", { locale: ja });
    const day = format(date, "E", { locale: ja });

    let dayStyle = "default-text";
    if (day === "日") {
      dayStyle = "red-text"; // 日曜日の場合、赤色にする
    } else if (day === "土") {
      dayStyle = "blue-text"; // 土曜日の場合、青色にする
    }

    return (
      <span className="default-text">
        {formattedDate.split("（")[0]}
        <span className={dayStyle}>{`（${day}）`}</span>
      </span>
    );
  };

  return (
    <div className="eventDetailContainer">
      <h1>イベント一覧</h1>
      <table className="eventDetailTable">
        <tbody>
          <tr>
            <td>開催日時</td>
            <td>
              {event.starttime_date &&
                formatDateWithDayStyle(event.starttime_date)}
              {event.starttime_hour && (
                <>{parseInt(event.starttime_hour, 10)}時</>
              )}
              {event.starttime_minute && event.starttime_minute !== "00" && (
                <>{parseInt(event.starttime_minute, 10)}分</>
              )}
              から
              {event.duration_hour && (
                <>{parseInt(event.duration_hour, 10)}時間</>
              )}
              {event.duration_minute && event.duration_minute !== "00" && (
                <>{parseInt(event.duration_minute, 10)}分</>
              )}
            </td>
          </tr>
          <tr>
            <td>締切日時</td>
            <td>
              {event.deadline_date &&
                formatDateWithDayStyle(event.deadline_date)}
              {event.deadline_hour && (
                <>{parseInt(event.deadline_hour, 10)}時</>
              )}
              {event.deadline_minute && event.deadline_minute !== "00" && (
                <>{parseInt(event.deadline_minute, 10)}分</>
              )}
            </td>
          </tr>
          <tr>
            <td>会場</td>
            <td>
              {event.site}（{event.site_region}）
            </td>
          </tr>
          <tr>
            <td>会場の地図</td>
            <td>{event.map}</td>
          </tr>

          <tr>
            <td>テニスコート</td>
            <td>
              {event.court_count}面　種類：
              {event.court_surface}
              　コート番号
              {event.court_num}
            </td>
          </tr>
          <tr>
            <td>定員</td>
            <td>{event.capacity}</td>
          </tr>
          <tr>
            <td>その他</td>
            <td>{event.detail}</td>
          </tr>

          <tr>
            <td>参加申込者</td>
            <td>
              <label htmlFor={`participants-${event.id}`}></label>
              <div className="participantListContainer">
                <ParticipantList
                  id={`participants-${event.id}`}
                  eventId={event.id}
                  eventMembers={eventMembers}
                  navigate={navigate}
                />
              </div>
            </td>
          </tr>

          <tr>
            <td>参加申込</td>
            <td>
              {userEventParticipation[event.id] ? (
                <button
                  className="button2"
                  onClick={() => handleJoinEvent(event.id)}
                >
                  参加申込済
                </button>
              ) : (
                <button
                  className="button3"
                  onClick={() => handleJoinEvent(event.id)}
                >
                  参加する
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EventDetail;

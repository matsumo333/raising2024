import React, { useEffect, useState } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./EventDetail.scss";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { ParticipantList } from "./ParticipantList";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [userEventParticipation, setUserEventParticipation] = useState({});
  const [participantCounts, setParticipantCounts] = useState({});
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("isAuth") === "true"
  );
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

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          console.log("Fetched event data:", eventData);

          // Splitting starttime into date, hour, and minute
          if (eventData.starttime) {
            const [date, time] = eventData.starttime.split("T");
            const [hour, minute] = time.split(":");
            console.log("Parsed starttime:", { date, hour, minute });

            // Splitting deadline into date, hour, and minute if it exists
            if (eventData.deadline) {
              const [deadline_date, deadline_time] =
                eventData.deadline.split("T");
              const [deadline_hour, deadline_minute] = deadline_time.split(":");
              setEvent({
                ...eventData,
                starttime_date: date,
                starttime_hour: hour,
                starttime_minute: minute,
                deadline_date,
                deadline_hour,
                deadline_minute,
              });
            } else {
              console.error("deadline field is missing or empty");
              setEvent({
                ...eventData,
                starttime_date: date,
                starttime_hour: hour,
                starttime_minute: minute,
                deadline_hour: "",
                deadline_minute: "",
              });
            }
          } else {
            console.error("starttime field is missing or empty");
            setEvent(eventData);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchEventData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent({
      ...event,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { starttime_date, starttime_hour, starttime_minute } = event;
    const starttime = `${starttime_date}T${starttime_hour}:${starttime_minute}`;
    const { deadline_date, deadline_hour, deadline_minute } = event;
    const deadline = `${deadline_date}T${deadline_hour}:${deadline_minute}`;
    const duration = `${event.duration_hour}:${event.duration_minute}`;

    const startTimeDate = new Date(starttime);
    const deadlineDate = new Date(deadline);

    const deadlineCheck = new Date(
      startTimeDate.getTime() - 3 * 60 * 60 * 1000
    );

    // Check if deadline is at least 3 hours before start time
    if (deadlineDate >= deadlineCheck) {
      alert(
        "The deadline must be set at least 3 hours before the event start time."
      );
      return; // Cancel submission if condition is not met
    }

    const updatedEvent = {
      ...event,
      starttime,
      duration,
      deadline,
      updated_at: new Date().toISOString(),
      author: {
        username: auth.currentUser ? auth.currentUser.displayName : "anonymous",
        id: auth.currentUser ? auth.currentUser.uid : "unknown",
      },
    };

    try {
      await updateDoc(doc(db, "events", id), updatedEvent);
      console.log("Event information successfully updated");
      navigate("/eventlist");
    } catch (error) {
      console.error("Error updating event information:", error);
    }
  };
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
    <div className="container_ed">
      <div className="content_ed">
        <h1>{event.title}</h1>
        <form onSubmit={handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>開催日時</td>
                <td>
                  {event.starttime_date &&
                    formatDateWithDayStyle(event.starttime_date)}
                  {event.starttime_hour && (
                    <>{parseInt(event.starttime_hour, 10)}時</>
                  )}
                  {event.starttime_minute &&
                    event.starttime_minute !== "00" && (
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
                {" "}
                <td>
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
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default EventDetail;

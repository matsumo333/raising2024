import React, { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
// import "./EventForm.scss";
import { useNavigate, useParams } from "react-router-dom";

const EventCreate = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          // Splitting starttime into date, hour, and minute
          const [date, time] = eventData.starttime.split("T");
          const [hour, minute] = time.split(":");
          // Splitting deadline into date, hour, and minute
          const [deadline_date, deadline_time] = eventData.deadline.split("T");
          const [deadline_hour, deadline_minute] = deadline_time.split(":");
          setEvent({
            ...eventData,
            starttime_date: date, // Only date part for date input
            starttime_hour: hour, // Separate hour part for hour input
            starttime_minute: minute, // Separate minute part for minute input
            deadline_date,
            deadline_hour,
            deadline_minute,
          });
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
    const duration = `${event.duration_hour}:${event.duration_minute}`;
    const { deadline_date, deadline_hour, deadline_minute } = event;
    const deadline = `${deadline_date}T${deadline_hour}:${
      deadline_minute || "00"
    }`;

    const startTimeDate = new Date(starttime);
    console.log("AA" + startTimeDate);
    const deadlineDate = new Date(deadline);

    console.log("BB deadline string: " + deadline);
    console.log("CC deadline Date: " + deadlineDate);

    // 締め切り時間が開始時間の3時間前までであることをチェック
    if (
      deadlineDate >= new Date(startTimeDate.getTime() - 3 * 60 * 60 * 1000)
    ) {
      alert("締め切り時間は開催時間の3時間前までに設定してください。");
      return; // 条件を満たさない場合、送信をキャンセル
    }

    const eventWithTimestampAndAuthor = {
      ...event,
      starttime,
      duration,
      deadline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        username: auth.currentUser ? auth.currentUser.displayName : "anonymous",
        id: auth.currentUser ? auth.currentUser.uid : "unknown",
      },
    };

    try {
      await addDoc(collection(db, "events"), eventWithTimestampAndAuthor);
      navigate("/eventlist");
      console.log("イベント情報が正常に送信されました");
    } catch (error) {
      console.error("イベント情報の送信中にエラーが発生しました:", error);
    }
  };

  return (
    <div className="eventFormContainer">
      <h1>イベント情報入力フォーム</h1>
      <form onSubmit={handleSubmit}>
        <div className="formField">
          <label>タイトル:</label>
          <input
            type="text"
            name="title"
            value={event.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formField">
          <label>開催場所:</label>
          <input
            type="text"
            name="site"
            value={event.site}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formField">
          <label>地図:</label>
          <input
            type="text"
            name="map"
            value={event.map}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formField">
          <label>地域:</label>
          <input
            type="text"
            name="site_region"
            value={event.site_region}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formFieldsplit">
          <label>開始日:</label>
          <input
            type="date"
            name="starttime_date"
            value={event.starttime_date}
            onChange={handleChange}
            required
          />
          <label>開始時間:</label>
          <select
            name="starttime_hour"
            value={event.starttime_hour}
            onChange={handleChange}
            required
          >
            {[...Array(24).keys()].map((hour) => (
              <option key={hour} value={hour < 10 ? `0${hour}` : hour}>
                {hour < 10 ? `0${hour}` : hour}
              </option>
            ))}
          </select>
          時　
          <select
            name="starttime_minute"
            value={event.starttime_minute}
            onChange={handleChange}
            required
          >
            <option value="00">00</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
          </select>
          分
        </div>

        <div className="formFieldsplit">
          <label>開催時間:</label>
          <select
            name="duration_hour"
            value={event.duration_hour}
            onChange={handleChange}
            required
          >
            {[...Array(14).keys()].map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          時間　
          <select
            name="duration_minute"
            value={event.duration_minute}
            onChange={handleChange}
            required
          >
            <option value="00">00</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
          </select>
          分
        </div>

        <div className="formFieldsplit">
          <label>締切日:</label>
          <input
            type="date"
            name="deadline_date"
            value={event.deadline_date}
            onChange={handleChange}
            required
          />
          <label>締切時間:</label>
          <select
            name="deadline_hour"
            value={event.deadline_hour}
            onChange={handleChange}
            required
          >
            {[...Array(24).keys()].map((hour) => (
              <option key={hour} value={hour < 10 ? `0${hour}` : hour}>
                {hour < 10 ? `0${hour}` : hour}
              </option>
            ))}
          </select>
          時　
          <select
            name="deadline_minute"
            value={event.deadline_minute}
            onChange={handleChange}
            required
          >
            {[...Array(6).keys()].map((i) => {
              const minute = i * 10;
              return (
                <option
                  key={minute}
                  value={minute < 10 ? `0${minute}` : minute}
                >
                  {minute < 10 ? `0${minute}` : minute}
                </option>
              );
            })}
          </select>
          分
        </div>

        <div className="formField">
          <label>コートのサーフェス:</label>
          <input
            type="text"
            name="court_surface"
            value={event.court_surface}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formField">
          <label>コートの数:</label>
          <input
            type="number"
            name="court_count"
            value={event.court_count}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formField">
          <label>コートの番号:</label>
          <input
            type="text"
            name="court_num"
            value={event.court_num}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formField">
          <label>定員:</label>
          <input
            type="number"
            name="capacity"
            value={event.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formField">
          <label>詳細:</label>
          <textarea
            name="detail"
            value={event.detail}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formField">
          <label>パスワード:</label>
          <input
            type="password"
            name="password"
            value={event.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formField">
          <label>ランク:</label>
          <input
            type="text"
            name="rank"
            value={event.rank}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default EventCreate;

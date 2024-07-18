import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
// import "./EventForm.scss";
import { useNavigate } from "react-router-dom";

const EventForm = () => {
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
    gmap: "",
    detail: "",
    password: "",
    rank: "",
    created_at: "",
    updated_at: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent({
      ...event,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      starttime_date,
      starttime_hour,
      starttime_minute,
      duration_hour,
      duration_minute,
      deadline_date,
      deadline_hour,
      deadline_minute,
    } = event;

    // starttime_minuteが空の場合は"00"を設定
    const validatedStarttimeMinute =
      starttime_minute === "" ? "00" : starttime_minute;
    const validatedStarttimeHour =
      starttime_hour === "" ? "00" : starttime_hour;
    const starttime = `${starttime_date}T${validatedStarttimeHour}:${validatedStarttimeMinute}`;

    // duration_minuteが空の場合は"00"を設定
    const validatedDurationMinute =
      duration_minute === "" ? "00" : duration_minute;
    const duration = `${duration_hour}:${validatedDurationMinute}`;

    // deadline_minuteが空の場合は"00"を設定
    const validatedDeadlineHour = deadline_hour === "" ? "00" : deadline_hour;
    const validatedDeadlineMinute =
      deadline_minute === "" ? "00" : deadline_minute;
    const deadline = `${deadline_date}T${validatedDeadlineHour}:${validatedDeadlineMinute}`;
    const startTimeDate = new Date(starttime);
    console.log("AA" + startTimeDate);
    const deadlineDate = new Date(deadline);

    console.log("BB" + deadline);

    console.log("CC" + deadlineDate);
    const deadlineCheck = new Date(
      startTimeDate.getTime() - 2 * 60 * 60 * 1000
    );
    console.log("DD" + deadlineCheck);
    // 締め切り時間が開始時間の3時間前までであることをチェック
    if (
      deadlineDate >= new Date(startTimeDate.getTime() - 2 * 60 * 60 * 1000)
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
            name="gmap"
            value={event.mapsite}
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
            <option value="00">00</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
          </select>
          分
        </div>
        <div className="formField">
          <label>コートの種類:</label>
          <input
            type="text"
            name="court_surface"
            value={event.court_surface}
            onChange={handleChange}
          />
        </div>
        <div className="formField">
          <label>コートの数:</label>
          <input
            type="number"
            name="court_count"
            value={event.court_count}
            onChange={handleChange}
          />
        </div>
        <div className="formField">
          <label>コート番号:</label>
          <input
            type="text"
            name="court_num"
            value={event.court_num}
            onChange={handleChange}
          />
        </div>
        <div className="formField">
          <label>収容人数:</label>
          <input
            type="number"
            name="capacity"
            value={event.capacity}
            onChange={handleChange}
          />
        </div>
        <div className="formField">
          <label>詳細:</label>
          <textarea
            name="detail"
            value={event.detail}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>
        <div className="formField">
          <label>ランク:</label>
          <input
            type="text"
            name="rank"
            value={event.rank}
            onChange={handleChange}
          />
        </div>
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default EventForm;

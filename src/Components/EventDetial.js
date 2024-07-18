import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./EventDetial.scss";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

const EventDetial = () => {
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
          console.log("Fetched event data:", eventData);

          // Splitting starttime into date, hour, and minute
          if (eventData.starttime) {
            const [date, time] = eventData.starttime.split("T");
            const [hour, minute] = time.split(":");
            console.log("Parsed starttime:", { date, hour, minute });
            // Splitting deadline into date, hour, and minute
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
            console.error("starttime field is missing or empty");
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
                  {format(parseISO(event.starttime), "yyyy年M月d日（E）", {
                    locale: ja,
                  })}
                  　{event.starttime_hour}時{event.starttime_minute}分から
                  {event.duration_hour}時間 {event.duration_minute}分
                </td>
              </tr>
              <td>締切日時</td>
              <td>
                {format(parseISO(event.deadline), "yyyy年M月d日（E）", {
                  locale: ja,
                })}
                　{event.deadline_hour}時{event.deadline_minute}分
              </td>
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
            </tbody>
          </table>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default EventDetial;

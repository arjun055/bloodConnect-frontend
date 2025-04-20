import { useState } from "react";
import axios from "axios";

const Hospital = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [range, setRange] = useState("Everyone");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const hospitalLat = position.coords.latitude;
        const hospitalLng = position.coords.longitude;

        try {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/send-notifications`, {
            title,
            message,
            hospitalLat,
            hospitalLng,
            range,
          });

          alert(response.data.message);
        } catch (err) {
          console.error("Error sending notification:", err);
          alert("Failed to send notifications");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Could not get hospital location");
      }
    );
  };

  return (
    <div>
      <h2>Send Notification to Donors</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Notification Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <br />
        <label>Range (in km): </label>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="Everyone">Everyone</option>
          <option value="1">1 km</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="15">15 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
          <option value="100">100 km</option>
          <option value="200">200 km</option>
          <option value="300">300 km</option>
        </select>
        <br />
        <button type="submit">Send Notification</button>
      </form>
    </div>
  );
};

export default Hospital;

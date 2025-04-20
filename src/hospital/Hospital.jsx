import { useState } from "react";
import axios from "axios";
import "./Hospital.css";

const Hospital = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [range, setRange] = useState("Everyone");
  const [bloodType, setBloodType] = useState("Everyone");


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
            bloodType
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
    <div className="hospital-container">
      <div className="hospital-card">
        <h2 className="hospital-heading">Send Notification to Donors</h2>
        <form onSubmit={handleSubmit} className="hospital-form">
          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="hospital-input"
          />
          <br />
          <textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="hospital-input hospital-textarea"
          />
          <br />
          <label className="hospital-label">Select Range (in km): </label>
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)} 
            className="hospital-select"
          >
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
          <label className="hospital-label">Select Blood Group: </label>
          <select 
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="hospital-select"
            required
          >
            <option value="Everyone">Everyone</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <br />
          <button type="submit" className="hospital-button">Send Notification</button>
        </form>
      </div>
    </div>
  );
};

export default Hospital;

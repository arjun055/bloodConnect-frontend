import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./AuthForm.css";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bloodType: "",
    id: "",
    userType: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (!isLogin && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prevData) => ({
            ...prevData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    }
  }, [isLogin]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: "",
      email: "",
      password: "",
      bloodType: "",
      id: "",
      userType: "",
      latitude: null,
      longitude: null,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting Form Data:", formData); // Debugging step

    if (!isLogin && (formData.latitude === null || formData.longitude === null)) {
        alert("Fetching location... Please try again.");
        return;
    }
    
    const url = isLogin ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/login` : `${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`;

    try {
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert(response.data.message); 
      console.log("Response:", response.data);

      if (response.data.user && response.data.user._id && response.data.user.email) {
        localStorage.setItem("user", JSON.stringify({
          id: response.data.user._id,
          email: response.data.user.email,
          userType: response.data.user.userType
        }));
        console.log("User info saved to localStorage!");

        if (response.data.user.userType === "Donor") {
          navigate("/donor");
        } else if (response.data.user.userType === "Hospital") {
          navigate("/hospital");
        } else {
          alert("Unknown user type");
        }
      } else {
        console.warn("User data not found in response, localStorage not updated.");
      }
      
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div className="auth-container">
      <div className="tab-container">
        <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
        <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>Signup</button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login Form" : "Signup Form"}</h2>

        {!isLogin && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <>
            <select name="userType" onChange={handleChange} required>
              <option value="">Select User Type</option>
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="blood bank">Blood Bank</option>
            </select>

            {formData.userType === "donor" && (
              <input
                type="text"
                name="bloodType"
                placeholder="Blood Type"
                value={formData.bloodType}
                onChange={handleChange}
                required
              />
            )}

            {(formData.userType === "hospital" || formData.userType === "blood bank") && (
              <input
                type="text"
                name="id"
                placeholder={`Enter ${formData.userType === "hospital" ? "Hospital" : "Blood Bank"} ID`}
                value={formData.id}
                onChange={handleChange}
                pattern={formData.userType === "hospital" ? "hos.*" : "bb.*"}
                title={formData.userType === "hospital" ? "ID should start with 'hos...'" : "ID should start with 'bb...' "}
                required
              />
            )}
          </>
        )}

        {isLogin && <a href="#">Forgot password?</a>}

        <button type="submit">{isLogin ? "Login" : "Signup"}</button>

        <p>
          {isLogin ? "Not a member?" : "Already have an account?"} {" "}
          <span className="toggle-link" onClick={handleToggle}>
            {isLogin ? "Signup now" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default AuthForm;

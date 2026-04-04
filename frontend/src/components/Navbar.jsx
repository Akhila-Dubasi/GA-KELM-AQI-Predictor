import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ setAQI = () => {} }) {
  const [city, setCity] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = async () => {
    if (!city) return;

    try {
      // 🌍 Convert city → lat/lng
      const geo = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
      );

      if (geo.data.length === 0) {
        alert("City not found");
        return;
      }

      const lat = parseFloat(geo.data[0].lat);
      const lng = parseFloat(geo.data[0].lon);

      // 🔥 Backend call
      const res = await axios.post("http://localhost:5000/api/aqi", {
        lat,
        lng,
      });

      setAQI({
        ...res.data,
        lat,
        lng,
      });

      // 👉 Always go to home after search
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error fetching AQI");
    }
  };

  // 🎯 Active tab highlight
  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="card navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {/* 🌍 LOGO */}
      <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        🌍 AirQuality.AI
      </h2>

      {/* 🔥 NAVIGATION */}
      <div style={{ display: "flex", gap: "25px" }}>
        <span
          onClick={() => navigate("/")}
          style={{
            cursor: "pointer",
            color: isActive("/") ? "#00e5ff" : "#cbd5f5",
            fontWeight: "500",
          }}
        >
          Home
        </span>

        <span
          onClick={() => navigate("/dashboard")}
          style={{
            cursor: "pointer",
            color: isActive("/dashboard") ? "#00e5ff" : "#cbd5f5",
            fontWeight: "500",
          }}
        >
          Dashboard
        </span>

        <span
          onClick={() => navigate("/precautions")}
          style={{
            cursor: "pointer",
            color: isActive("/precautions") ? "#00e5ff" : "#cbd5f5",
            fontWeight: "500",
          }}
        >
          Precautions
        </span>
      </div>

      {/* 🔍 SEARCH */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            outline: "none",
          }}
        />
          <button
  onClick={() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await axios.post("http://localhost:5000/api/aqi", {
        lat,
        lng,
      });

      setAQI({ ...res.data, lat, lng });
    });
  }}
  style={{
    background: "#22c55e",
    color: "white",
    borderRadius: "10px",
    padding: "10px",
  }}
>
  📍 Use Location
</button>
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 15px",
            borderRadius: "10px",
            border: "none",
            background: "#38bdf8",
            color: "white",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
}
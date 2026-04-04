import { useState } from "react";
import Navbar from "../components/Navbar";
import AQICard from "../components/AQICard";
import PollutantCard from "../components/PollutantCard";
import ForecastChart from "../components/ForecastChart";
import MapView from "../components/MapView";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🔥 AQI BASED BACKGROUND COLOR */
  const getBG = () => {
    if (!data) return "radial-gradient(circle at top, #0f172a, #020617)";
    if (data.aqi <= 50) return "radial-gradient(circle, #022c22, #020617)";
    if (data.aqi <= 100) return "radial-gradient(circle, #3f2e05, #020617)";
    if (data.aqi <= 150) return "radial-gradient(circle, #3f1d05, #020617)";
    return "radial-gradient(circle, #3f0505, #020617)";
  };

  return (
    <div
      className="container"
      style={{
        background: getBG(),
        minHeight: "100vh",
        transition: "0.5s ease",
      }}
    >
      {/* 🌌 PARTICLES (VISIBLE NOW) */}
      <div className="particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 🔝 NAVBAR */}
      <Navbar setAQI={setData} setLoading={setLoading} />

      {/* 🔥 HERO SECTION (NEW PREMIUM ADDITION) */}
      <div className="card hero">
        <div>
          <h1 style={{ fontSize: "28px" }}>
            🌍 Real-Time Air Quality Intelligence
          </h1>
          <p style={{ color: "#94a3b8" }}>
            Monitor pollution levels, predict AQI trends, and make healthier decisions.
          </p>
        </div>

        {/* 👉 Add image in assets and import if needed */}
  
      </div>
       {/* 🗺️ MAP */}
      {/* 🔄 LOADING */}
      {loading && (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#00e5ff" }}>Fetching AQI Data...</p>
        </div>
      )}

      {/* 🌍 AQI CARD */}
      <AQICard data={data} />
      <MapView setAQI={setData} />
      {/* 🌫️ POLLUTANTS */}
      {data && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
          }}
        >
          <PollutantCard title="PM2.5" value={data.pm25} />
          <PollutantCard title="PM10" value={data.pm10} />
          <PollutantCard title="NO2" value={data.no2} />
          <PollutantCard title="O3" value={data.o3} />
        </div>
      )}

      {/* 📈 FORECAST */}
      <ForecastChart lat={data?.lat} lng={data?.lng} />
    </div>
  );
}
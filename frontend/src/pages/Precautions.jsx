import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Precautions() {
  const [activeTab, setActiveTab] = useState("current");

  const aqi = 68;

  const getStatus = () => {
    if (aqi <= 50) return { label: "Good", color: "#22c55e" };
    if (aqi <= 100) return { label: "Moderate", color: "#facc15" };
    if (aqi <= 150) return { label: "Unhealthy", color: "#f97316" };
    return { label: "Hazardous", color: "#ef4444" };
  };

  const status = getStatus();

  return (
    <div className="container">
      <Navbar />

      {/* 🔥 HEADER */}
      <div className="card">
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          🛡️ Safety Guidelines
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Learn how to protect yourself and reduce air pollution
        </p>

        {/* 🔥 TABS */}
        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          {["current", "reduce", "protect"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg,#3b82f6,#a855f7)"
                    : "rgba(255,255,255,0.05)",
                color: "white",
              }}
            >
              {tab === "current" && "⚠️ Current Precautions"}
              {tab === "reduce" && "🌱 Reduce Pollution"}
              {tab === "protect" && "🛡️ Protect Yourself"}
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 AQI CARD */}
      <div
        className="card"
        style={{
          border: `2px solid ${status.color}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ color: "#94a3b8" }}>Current Air Quality</p>
          <h1>{status.label}</h1>
        </div>

        <div style={{ textAlign: "right" }}>
          <h1 style={{ color: status.color }}>{aqi}</h1>
          <p style={{ color: "#94a3b8" }}>AQI Index</p>
        </div>
      </div>

      {/* 🔥 TAB CONTENT */}
      {activeTab === "current" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="card">❌ Sensitive people limit outdoor activity</div>
          <div className="card">❌ Close windows during traffic hours</div>
          <div className="card">❌ Monitor respiratory health</div>
          <div className="card">✅ Safe for normal outdoor activity</div>
        </div>
      )}

      {activeTab === "reduce" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="card">
            🌳 <h3>Plant More Trees</h3>
            <p>Absorb pollutants and improve air quality</p>
          </div>

          <div className="card">
            🚗 <h3>Reduce Vehicle Emissions</h3>
            <p>Use public transport or EVs</p>
          </div>

          <div className="card">
            ⚡ <h3>Energy Conservation</h3>
            <p>Switch to renewable energy</p>
          </div>

          <div className="card">
            🔥 <h3>Avoid Burning</h3>
            <p>Reduce harmful emissions</p>
          </div>
        </div>
      )}

      {activeTab === "protect" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="card">
            😷 <h3>N95 Masks</h3>
            <p>Wear when AQI is high</p>
          </div>

          <div className="card">
            🌬️ <h3>Air Purifiers</h3>
            <p>Remove indoor pollutants</p>
          </div>

          <div className="card">
            🌿 <h3>Indoor Plants</h3>
            <p>Natural air purification</p>
          </div>

          <div className="card">
            🚰 <h3>Stay Hydrated</h3>
            <p>Flush toxins</p>
          </div>

          <div className="card">
            🫁 <h3>Monitor Health</h3>
            <p>Track symptoms</p>
          </div>

          <div className="card">
            🪟 <h3>Ventilation Timing</h3>
            <p>Open windows at low AQI times</p>
          </div>
        </div>
      )}
    </div>
  );
}
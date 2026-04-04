import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import axios from "axios";
import { useEffect, useState } from "react";

// 🌆 Major cities
const cities = [
  { name: "Delhi", lat: 28.61, lng: 77.20 },
  { name: "Mumbai", lat: 19.07, lng: 72.87 },
  { name: "Hyderabad", lat: 17.38, lng: 78.48 },
  { name: "Chennai", lat: 13.08, lng: 80.27 },
  { name: "Bangalore", lat: 12.97, lng: 77.59 },
  { name: "Kolkata", lat: 22.57, lng: 88.36 },
];

// 🎨 AQI → Color
const getColor = (aqi) => {
  if (aqi <= 50) return "#22c55e"; // green
  if (aqi <= 100) return "#eab308"; // yellow
  if (aqi <= 150) return "#f97316"; // orange
  if (aqi <= 200) return "#ef4444"; // red
  return "#a855f7"; // purple
};

// 📍 Custom marker icon
const createIcon = (color) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:50%;
        background:${color};
        box-shadow: 0 0 12px ${color}, 0 0 25px ${color};
        border:2px solid white;
        animation: pulse 1.5s infinite;
      "></div>
    `,
  });

// 📍 Click handler
function ClickHandler({ setAQI, setMarker }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      try {
        const res = await axios.post("http://localhost:5000/api/aqi", {
          lat,
          lng,
        });

        setMarker([lat, lng]);
        setAQI(res.data);
      } catch (err) {
        console.error(err);
      }
    },
  });

  return null;
}

// 🔥 Heatmap Layer
function Heatmap({ points }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (!points.length) return;

    const heatLayer = L.heatLayer(points, {
  radius: 30,
  blur: 20,
  maxZoom: 10,
  gradient: {
    0.2: "#22c55e",
    0.4: "#eab308",
    0.6: "#f97316",
    0.8: "#ef4444",
    1.0: "#a855f7",
  },
}).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points]);

  return null;
}

export default function MapView({ setAQI }) {
  const [marker, setMarker] = useState(null);
  const [cityData, setCityData] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);

  // 🔥 Load AQI for cities
  useEffect(() => {
    const fetchCities = async () => {
      const results = [];

      for (let city of cities) {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/aqi",
            {
              lat: city.lat,
              lng: city.lng,
            }
          );

          results.push({
            ...city,
            aqi: res.data.aqi,
          });
        } catch {
          results.push({ ...city, aqi: 50 });
        }
      }

      setCityData(results);

      // 🔥 Prepare heatmap
      const heat = results.map((c) => [
        c.lat,
        c.lng,
        c.aqi / 200, // normalize
      ]);

      setHeatPoints(heat);
    };

    fetchCities();
  }, []);

  return (
    <div className="card">
      <h3>📍  AQI Map (Live)</h3>

     <MapContainer
  center={[22.97, 78.65]}
  zoom={5}
  style={{
    height: "500px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
  }}
>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* 🔥 Heatmap */}
        <Heatmap points={heatPoints} />

        {/* 🔥 Click */}
        <ClickHandler setAQI={setAQI} setMarker={setMarker} />

        {/* 🔥 Selected marker */}
        {marker && (
          <Marker position={marker}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}

        {/* 🔥 City markers */}
        {cityData.map((city, i) => (
          <Marker
            key={i}
            position={[city.lat, city.lng]}
            icon={createIcon(getColor(city.aqi))}
          >
            <Popup>
  <div style={{ textAlign: "center" }}>
    <h3 style={{ margin: 0 }}>{city.name}</h3>
    <h2 style={{ color: getColor(city.aqi) }}>{city.aqi}</h2>
    <p>{city.aqi <= 100 ? "🙂 Safe" : "⚠️ Caution"}</p>
  </div>
</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
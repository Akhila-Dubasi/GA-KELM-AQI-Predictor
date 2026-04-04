import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ForecastChart({ lat, lng }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchForecast = async () => {
      try {
       const res = await axios.post("http://localhost:5000/api/forecast", {
  lat,
  lng,
});
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchForecast();
  }, [lat, lng]);

  if (!lat || !lng) return null;

  return (
    <div className="card">
      <h3>📈 7-Day Forecast</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line
  type="monotone"
  dataKey="aqi"
  stroke="#00e5ff"
  strokeWidth={3}
  dot={{ r: 5 }}
  activeDot={{ r: 8 }}
/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
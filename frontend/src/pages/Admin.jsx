import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function Admin() {
  const [data, setData] = useState([]);
  const [rmse, setRmse] = useState(null);
  const [r2, setR2] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/admin/metrics");

        setRmse(res.data.rmse);
        setR2(res.data.r2);
        setData(res.data.chart);

      } catch (err) {
        console.error(err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>🧠 Model Admin Dashboard</h1>

      {/* 🔥 METRICS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="card">
          <h3>RMSE</h3>
          <h2>{rmse}</h2>
        </div>

        <div className="card">
          <h3>R² Score</h3>
          <h2>{r2}</h2>
        </div>
      </div>

      {/* 🔥 CHART */}
      <div className="card">
        <h3>Actual vs Predicted AQI</h3>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              name="Actual"
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#ef4444"
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
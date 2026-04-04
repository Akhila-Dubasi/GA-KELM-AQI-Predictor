import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================================
   🌍 GENERATE POLLUTANTS (SIMULATED DATA)
========================================= */
function generatePollutants(lat, lng) {
  let base = 50;

  // North India → more pollution
  if (lat > 25) base += 50;

  // Coastal → cleaner
  if (lat < 15) base -= 20;

  return {
    pm25: Math.max(10, base + Math.random() * 20),
    pm10: Math.max(20, base + Math.random() * 40),
    no2: Math.random() * 40,
    so2: Math.random() * 30,
    co: Math.random() * 2,
    o3: Math.random() * 60,
  };
}

/* =========================================
   🧠 AQI PREDICTION API
========================================= */
app.post("/api/aqi", async (req, res) => {
  const { lat, lng } = req.body;

  try {
    /* 🔥 STEP 1: FETCH LIVE DATA */
    const apiRes = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality`,
      {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: "pm10,pm2_5,nitrogen_dioxide,ozone",
        },
      }
    );

    const hourly = apiRes.data.hourly;

    // 🔥 Latest data (last index)
    const i = hourly.time.length - 1;

    const pollutants = {
      pm25: hourly.pm2_5[i] || 50,
      pm10: hourly.pm10[i] || 60,
      no2: hourly.nitrogen_dioxide[i] || 20,
      o3: hourly.ozone[i] || 30,
      so2: 10,
      co: 0.5,
    };

    console.log("🌍 LIVE POLLUTANTS:", pollutants);

    /* 🔥 STEP 2: SEND TO ML MODEL */
    let aqi;

    try {
      const mlRes = await axios.post(
        "http://127.0.0.1:8000/predict",
        pollutants
      );

      aqi = mlRes.data?.aqi;
    } catch {
      console.log("⚠️ ML failed → fallback used");
    }

    /* 🔥 STEP 3: FALLBACK */
    if (!aqi || isNaN(aqi)) {
      aqi = pollutants.pm25 * 2;
    }

    aqi = Math.round(aqi);

    /* 🔥 STEP 4: STATUS */
    let status = "Good";
    if (aqi > 50) status = "Moderate";
    if (aqi > 100) status = "Unhealthy";
    if (aqi > 150) status = "Very Unhealthy";
    if (aqi > 200) status = "Hazardous";

    res.json({
      aqi,
      status,
      lat,
      lng,
      ...pollutants,
    });

  } catch (err) {
    console.error("❌ API ERROR:", err.message);
    res.status(500).json({ error: "Live API failed" });
  }
});

/* =========================================
   📈 7-DAY FORECAST API
========================================= */
app.post("/api/forecast", async (req, res) => {
  const { lat, lng } = req.body;

  try {
    const apiRes = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality`,
      {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: "pm2_5",
        },
      }
    );

  const times = apiRes.data.hourly.time;
const pm25 = apiRes.data.hourly.pm2_5;

const forecast = [];

/* ✅ FIND CURRENT INDEX (NOT MIDNIGHT — REAL TIME) */
const now = new Date();

const currentIndex = times.findIndex(
  (t) => new Date(t) >= now
);

const baseIndex = currentIndex !== -1 ? currentIndex : 0;

/* 🔥 LAST KNOWN VALUE (for fallback prediction) */
let lastValue = pm25[baseIndex] || 50;

/* ✅ ALWAYS GENERATE 7 DAYS */
for (let i = 0; i < 7; i++) {
  const index = baseIndex + i * 24;

  let value;

  if (pm25[index]) {
    value = pm25[index];
    lastValue = value;
  } else {
    // 🔥 SMART PREDICTION (trend-based)
    value = lastValue + Math.sin(i) * 5 + Math.random() * 5;
  }

  let predictedAQI;

  try {
    const mlRes = await axios.post(
      "http://127.0.0.1:8000/predict",
      {
        pm25: value,
        pm10: value * 1.2,
        no2: 20,
        so2: 10,
        co: 0.5,
        o3: 30,
      }
    );

    predictedAQI = mlRes.data?.aqi;
  } catch {
    predictedAQI = value * 2;
  }

  forecast.push({
    day: new Date(
      now.getTime() + i * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    aqi: Math.round(predictedAQI),
  });
}

res.json(forecast);

  } catch (err) {
    console.error("❌ FORECAST API ERROR:", err.message);
    res.status(500).json({ error: "Forecast failed" });
  }
});
/* =========================================
   🧪 HEALTH CHECK
========================================= */
app.get("/", (req, res) => {
  res.send("✅ AQI Backend Running");
});

/* =========================================
   🚀 START SERVER
========================================= */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
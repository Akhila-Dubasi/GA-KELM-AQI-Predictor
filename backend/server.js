import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

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
          current: "pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide",
        },
      }
    );

    const currentData = apiRes.data.current;

    const pollutants = {
      pm25: currentData.pm2_5 || 50,
      pm10: currentData.pm10 || 60,
      no2: currentData.nitrogen_dioxide || 20,
      o3: currentData.ozone || 30,
      so2: currentData.sulphur_dioxide || 10,
      co: currentData.carbon_monoxide || 0.5,
    };

    console.log("🌍 LIVE POLLUTANTS:", pollutants);

    /* 🔥 STEP 2: SEND TO ML MODEL */
    let aqi;

    try {
      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/predict`,
        pollutants
      );

      aqi = mlRes.data?.aqi;
    } catch {
      console.log("⚠️ ML failed → fallback used");
    }

    /* 🔥 STEP 3: FALLBACK / SANITY CHECK USING INDIAN NAQI */
    const calculateNAQI = (p25, p10) => {
       // PM2.5 to NAQI
       let aqi25 = p25;
       if(p25 <= 30) aqi25 = p25 * (50/30);
       else if(p25 <= 60) aqi25 = 51 + (p25-31)*(49/29);
       else if(p25 <= 90) aqi25 = 101 + (p25-61)*(99/29);
       else if(p25 <= 120) aqi25 = 201 + (p25-91)*(99/29);
       else aqi25 = 301 + (p25-121)*(99/129);

       // PM10 to NAQI
       let aqi10 = p10;
       if(p10 <= 50) aqi10 = p10;
       else if(p10 <= 100) aqi10 = 51 + (p10-51);
       else if(p10 <= 250) aqi10 = 101 + (p10-101)*(99/149);
       else aqi10 = 201 + (p10-251)*(99/99);

       return Math.max(aqi25, aqi10);
    };

    const calculatedIndianAQI = calculateNAQI(pollutants.pm25, pollutants.pm10);

    // Prioritize NAQI if ML failed, or ML severely underestimates Indian conditions
    if (!aqi || isNaN(aqi) || aqi < (calculatedIndianAQI - 30)) {
       aqi = calculatedIndianAQI;
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
          hourly: "pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide",
        },
      }
    );

    const h = apiRes.data.hourly;
    const times = h.time;
    const forecast = [];

    const now = new Date();
    const currentIndex = times.findIndex((t) => new Date(t) >= now);
    const baseIndex = currentIndex !== -1 ? currentIndex : 0;

    let lastKnown = {
      pm25: Number(h.pm2_5[baseIndex]) || 50,
      pm10: Number(h.pm10[baseIndex]) || 60,
      no2: Number(h.nitrogen_dioxide[baseIndex]) || 20,
      o3: Number(h.ozone[baseIndex]) || 30,
      so2: Number(h.sulphur_dioxide[baseIndex]) || 10,
      co: Number(h.carbon_monoxide[baseIndex]) || 0.5,
    };

    /* ✅ GENERATE 7 DAYS */
    for (let i = 0; i < 7; i++) {
        // Find mid-day index for each future day
        const dayDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        dayDate.setHours(12, 0, 0, 0); 
        let index = times.findIndex(t => new Date(t) >= dayDate);
        if (index === -1) index = baseIndex + i * 24; 
        if (index >= times.length) index = times.length - 1;
        
        let p = { ...lastKnown };
        
        if (h.pm2_5[index] !== null && h.pm2_5[index] !== undefined) {
            p = {
                pm25: Number(h.pm2_5[index]),
                pm10: Number(h.pm10[index]),
                no2: Number(h.nitrogen_dioxide[index]),
                o3: Number(h.ozone[index]),
                so2: Number(h.sulphur_dioxide[index]),
                co: Number(h.carbon_monoxide[index]),
            };
        } else {
            // slightly fluctuate based on last known
            p = {
                pm25: Math.max(1, lastKnown.pm25 + Math.sin(i) * 5),
                pm10: Math.max(1, lastKnown.pm10 + Math.sin(i) * 6),
                no2: Math.max(1, lastKnown.no2 + Math.cos(i) * 2),
                o3: Math.max(1, lastKnown.o3 + Math.sin(i) * 4),
                so2: Math.max(1, lastKnown.so2 + Math.cos(i) * 1),
                co: Math.max(0.1, lastKnown.co),
            };
        }
        
        // Ensure no NaN values propagate
        for (let key in p) {
           if (isNaN(p[key]) || p[key] === null) p[key] = lastKnown[key] || 10;
        }

        lastKnown = p; 

        let predictedAQI = 50;

        try {
            const mlRes = await axios.post(
                `${ML_SERVICE_URL}/predict`,
                p
            );
            if (mlRes.data?.aqi) {
                predictedAQI = mlRes.data.aqi;
            } else {
                predictedAQI = p.pm25 * 2;
            }
        } catch(err) {
            console.error("ML Prediction Error:", err.message);
            predictedAQI = p.pm25 * 2;
        }

        forecast.push({
            day: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
            aqi: Math.round(predictedAQI) || 50,
        });
    }

res.json(forecast);

  } catch (err) {
    console.error("❌ FORECAST API ERROR:", err.message);
    res.status(500).json({ error: "Forecast failed" });
  }
});
/* =========================================
   📜 7-DAY HISTORICAL DATA API
========================================= */
app.post("/api/history", async (req, res) => {
  const { lat, lng } = req.body;

  try {
    const apiRes = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality`,
      {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: "pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide",
          past_days: 7
        },
      }
    );

    const h = apiRes.data.hourly;
    const times = h.time;
    const historyData = [];
    const recentLogs = [];

    const now = new Date();
    // Start from 7 days ago and step Day by Day at noon
    for (let i = 7; i > 0; i--) {
        const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dayDate.setHours(12, 0, 0, 0); 
        // Find closest index
        let index = times.findIndex(t => new Date(t) >= dayDate);
        if (index === -1) index = 0; // fallback

        let p = {
            pm25: Number(h.pm2_5[index]) || 10,
            pm10: Number(h.pm10[index]) || 20,
            no2: Number(h.nitrogen_dioxide[index]) || 5,
            o3: Number(h.ozone[index]) || 30,
            so2: Number(h.sulphur_dioxide[index]) || 5,
            co: Number(h.carbon_monoxide[index]) || 0.1,
        };

        // get AQI via ML
        let aqi;
        try {
            const mlRes = await axios.post(`${ML_SERVICE_URL}/predict`, p);
            aqi = mlRes.data?.aqi;
        } catch {
            console.log("ML Failed for History")
        }
        
        aqi = Math.round(aqi || p.pm25 * 2);

        let status = "Good";
        let color = "text-green-400";
        if (aqi > 50) { status = "Moderate"; color = "text-yellow-400"; }
        if (aqi > 100) { status = "Unhealthy for Sensitive"; color = "text-orange-400"; }
        if (aqi > 150) { status = "Unhealthy"; color = "text-red-400"; }
        if (aqi > 200) { status = "Hazardous"; color = "text-rose-600"; }

        historyData.push({
            date: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
            aqi,
            pm25: Math.round(p.pm25),
            so2: Math.round(p.so2)
        });

        recentLogs.unshift({
            id: i,
            date: dayDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
            time: "12:00 PM",
            location: "Selected Location",
            aqi,
            status,
            color
        });
    }

    res.json({ historyData, recentLogs });

  } catch (err) {
    console.error("❌ HISTORY API ERROR:", err.message);
    res.status(500).json({ error: "History failed" });
  }
});

/* =========================================
   🤖 AI CHATBOT API (GEMINI)
========================================= */
app.post("/api/chat", async (req, res) => {
  const { messages, aqi, pm25, location } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is missing. Please add GEMINI_API_KEY to your backend .env file." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are AeroSense AI Health Guide, an expert AI assistant specializing in air quality and respiratory health. The user is currently at ${location || "an unknown location"}. The current AQI is ${aqi || "unknown"} and the PM2.5 level is ${pm25 || "unknown"} µg/m³. Provide personalized, concise, and helpful advice depending on these conditions. Stick to 2-4 sentences.`;

    // Drop the system message from history before passing it, @google/genai throws error if first content is 'model' without context, but since the first message is from assistant... wait actually we can just map it, but let's drop the default first message or keep it.
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(msg.text) }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error("❌ AI CHAT API ERROR:", err);
    res.status(500).json({ error: "Failed to fetch response from Gemini API" });
  }
});

/* =========================================
   📊 ADMIN METRICS PROXY API
========================================= */
app.get("/api/admin/metrics", async (req, res) => {
  try {
    const mlRes = await axios.get(`${ML_SERVICE_URL}/admin/metrics`);
    res.json(mlRes.data);
  } catch (err) {
    console.error("❌ ADMIN METRICS ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch model metrics" });
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader2, AlertTriangle, ShieldCheck, Leaf, HeartPulse, Heart } from "lucide-react";

export default function Precautions() {
  const [activeTab, setActiveTab] = useState("current");
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Selected Location");

  useEffect(() => {
    const fetchAqi = async () => {
      let lat = 28.6139, lng = 77.2090, name = "New Delhi"; // Default
      const savedLocation = localStorage.getItem('aqi_location');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        lat = Number(parsed.lat);
        lng = Number(parsed.lng);
        name = parsed.name || name;
      }
      setLocationName(name);

      try {
        const res = await axios.post('http://localhost:5000/api/aqi', { lat, lng });
        setAqiData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load real-time AQI");
        setAqiData({ aqi: 85, pm25: 25, pm10: 45, o3: 20, no2: 15 }); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchAqi();
  }, []);

  const getStatus = (val) => {
    if (val <= 50) return { label: "Good", color: "#22c55e", bg: "from-green-500/20 to-green-900/5", border: "border-green-500/30" };
    if (val <= 100) return { label: "Satisfactory", color: "#84cc16", bg: "from-lime-500/20 to-lime-900/5", border: "border-lime-500/30" };
    if (val <= 200) return { label: "Moderate", color: "#eab308", bg: "from-yellow-500/20 to-yellow-900/5", border: "border-yellow-500/30" };
    if (val <= 300) return { label: "Poor", color: "#f97316", bg: "from-orange-500/20 to-orange-900/5", border: "border-orange-500/30" };
    if (val <= 400) return { label: "Very Poor", color: "#ef4444", bg: "from-red-500/20 to-red-900/5", border: "border-red-500/30" };
    return { label: "Severe", color: "#991b1b", bg: "from-red-800/30 to-red-950/20", border: "border-red-800/40" };
  };

  const getDynamicPrecautions = (data) => {
    if (!data) return [];
    const val = data.aqi;
    let base = [];
    
    // Core AQI Rules
    if (val <= 50) base = [
      { text: "Air quality is ideal for outdoor activities.", good: true },
      { text: "Open windows to bring in fresh air.", good: true }
    ];
    else if (val <= 100) base = [
      { text: "Safe for normal outdoor activity.", good: true },
      { text: "Sensitive individuals should monitor for symptoms.", good: false }
    ];
    else if (val <= 200) base = [
      { text: "Reduce prolonged or heavy outdoor exertion.", good: false },
      { text: "Close windows during peak traffic hours.", good: false }
    ];
    else if (val <= 300) base = [
      { text: "Avoid all outdoor physical exertion.", good: false },
      { text: "Sensitive groups should strictly remain indoors.", good: false }
    ];
    else base = [
      { text: "HAZARDOUS: Avoid all outdoor activities.", good: false },
      { text: "Run air purifiers continuously indoors.", good: false }
    ];

    // Localized Target Warnings matching exact pollutants
    if (data.pm25 > 60) {
      base.push({ text: `Severe PM2.5 detected (${data.pm25} µg/m³). Normal masks bypass this; an N95 respirator is strictly required.`, good: false });
    }
    if (data.pm10 > 100) {
      base.push({ text: `High PM10 dust detected (${data.pm10} µg/m³). Indicates local construction or dust storms. Keep doors closed.`, good: false });
    }
    if (data.o3 > 100) {
      base.push({ text: "Ozone alert. Ozone reacts chemically with sunlight; avoid direct afternoon sun and remain in shade.", good: false });
    }
    if (data.no2 > 50) {
      base.push({ text: "High vehicular NO2 detected. Stay away from main roads and heavy traffic intersections.", good: false });
    }

    if (val <= 50 && data.pm25 < 30) {
       base.push({ text: "No special precautions needed for sensitive groups.", good: true });
    }

    return base;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentAQI = aqiData?.aqi || 85;
  const status = getStatus(currentAQI);
  const currentPrecautions = getDynamicPrecautions(aqiData);

  return (
    <div className="space-y-6 animate-fade-in relative z-10 w-full overflow-hidden p-2 sm:p-4">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            Safety & Precautions
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Actionable health guidelines for <span className="font-semibold text-white">{locationName}</span>
          </p>
        </div>

        {/* REAL-TIME STATUS CARD */}
        <div className={`px-6 py-4 rounded-2xl border ${status.border} bg-gradient-to-br ${status.bg} flex items-center gap-6 min-w-[250px]`}>
          <div>
            <p className="text-sm text-gray-300 font-medium tracking-wide uppercase">Current Level</p>
            <p className="text-2xl font-bold" style={{ color: status.color }}>{status.label}</p>
          </div>
          <div className="text-right border-l border-white/10 pl-6">
            <p className="text-4xl font-black" style={{ color: status.color }}>{currentAQI}</p>
            <p className="text-xs text-gray-400 mt-1">Real-time AQI</p>
          </div>
        </div>
      </motion.div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-none">
        {[
          { id: "current", icon: AlertTriangle, label: "Live Precautions" },
          { id: "reduce", icon: Leaf, label: "Reduce Pollution" },
          { id: "protect", icon: HeartPulse, label: "Protect Health" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {activeTab === "current" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPrecautions.map((precaution, idx) => (
              <div 
                key={idx} 
                className={`glass-card p-6 border-l-4 ${precaution.good ? 'border-l-green-500' : 'border-l-red-500'} flex items-start gap-4`}
              >
                <div className={`p-2 rounded-full ${precaution.good ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {precaution.good ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <p className="text-gray-200 text-lg leading-relaxed pt-1">{precaution.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reduce" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🌳", title: "Plant Trees", desc: "Native plants absorb CO2 and filter particulate matter." },
              { icon: "🚲", title: "Green Transit", desc: "Use public transport, carpool, or switch to electric vehicles." },
              { icon: "⚡", title: "Save Energy", desc: "Reduce power usage to decrease emissions from power plants." },
              { icon: "🔥", title: "Stop Burning", desc: "Avoid burning garbage, leaves, or using wood-burning stoves." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 hover:bg-white/5 transition-colors text-center pb-8">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "protect" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "😷", title: "N95 Respirators", desc: "Wear certified N95 masks when the AQI exceeds 150. Normal masks don't block PM2.5." },
              { icon: "🌬️", title: "Air Purifiers", desc: "Use HEPA-certified air purifiers indoors and keep windows firmly closed during peak pollution." },
              { icon: "🌿", title: "Indoor Flora", desc: "Keep Snake Plants, Spider Plants, or Aloe Vera to naturally purify indoor toxins." },
              { icon: "🚰", title: "Hydration", desc: "Drink plenty of water mixed with Vitamin C to help flush out airborne toxins from the body." },
              { icon: "🏃‍♂️", title: "Exercise Smarter", desc: "Only exercise outdoors during the early morning or when the AQI drops below 100." },
              { icon: "🩺", title: "Monitor Health", desc: "Individuals with asthma or heart conditions should keep their inhalers close." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 hover:border-blue-500/30 transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-3xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
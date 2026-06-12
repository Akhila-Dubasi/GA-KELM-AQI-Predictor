import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Cloud, Loader2, MapPin } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

import AQICard from '../components/AQICard';
import ForecastChart from '../components/ForecastChart';
import MapView from '../components/MapView';
import PollutantCard from '../components/PollutantCard';
import AQIScaleLegend from '../components/AQIScaleLegend';

import AiChatbot from '../components/AiChatbot';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [locationName, setLocationName] = useState('San Francisco, CA');
  const [coordinates, setCoordinates] = useState(null);

  const fetchWithCoordinates = async (lat, lng, name) => {
    setLoading(true);
    setError(null);
    setLocationName(name);

    try {
      const [aqiRes, forecastRes] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/aqi`, { lat, lng }),
        axios.post(`${API_BASE_URL}/api/forecast`, { lat, lng })
      ]);

      setAqiData(aqiRes.data);
      if (forecastRes.data && Array.isArray(forecastRes.data)) {
        setForecastData(forecastRes.data.map(item => ({
          time: item.day,
          aqi: item.aqi
        })));
      }
      setCoordinates({ lat, lng });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (lat, lng) => {
    try {
       const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
       const name = res.data.address?.city || res.data.address?.town || res.data.address?.village || 'Selected Location';
       localStorage.setItem('aqi_location', JSON.stringify({lat, lng, name}));
       fetchWithCoordinates(lat, lng, name);
    } catch(err) {
       localStorage.setItem('aqi_location', JSON.stringify({lat, lng, name: 'Selected Location'}));
       fetchWithCoordinates(lat, lng, 'Selected Location');
    }
  };

  useEffect(() => {
    let lat = 37.7749;
    let lng = -122.4194;
    let name = 'San Francisco, CA';

    const savedLocation = localStorage.getItem('aqi_location');
    if (savedLocation) {
      const parsed = JSON.parse(savedLocation);
      lat = Number(parsed.lat);
      lng = Number(parsed.lng);
      name = parsed.name || name;
    }
    
    fetchWithCoordinates(lat, lng, name);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-aqi-primary" />
      </div>
    );
  }

  if (error || !aqiData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center p-8 bg-red-900/20 border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400">{error || "Could not load data"}</p>
        </div>
      </div>
    );
  }

  const getPollutantStatus = (val, threshold) => val <= threshold ? 'Good' : 'Elevated';
  
  const pollutantsArray = [
    { name: 'PM2.5', value: aqiData.pm25?.toFixed(1) || 0, unit: 'µg/m³', status: getPollutantStatus(aqiData.pm25, 35.4) },
    { name: 'PM10', value: aqiData.pm10?.toFixed(1) || 0, unit: 'µg/m³', status: getPollutantStatus(aqiData.pm10, 154) },
    { name: 'NO2', value: aqiData.no2?.toFixed(1) || 0, unit: 'ppb', status: getPollutantStatus(aqiData.no2, 53) },
    { name: 'O3', value: aqiData.o3?.toFixed(1) || 0, unit: 'ppb', status: getPollutantStatus(aqiData.o3, 70) },
    { name: 'CO', value: aqiData.co?.toFixed(2) || 0, unit: 'ppm', status: getPollutantStatus(aqiData.co, 9.4) },
    { name: 'SO2', value: aqiData.so2?.toFixed(1) || 0, unit: 'ppb', status: getPollutantStatus(aqiData.so2, 75) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Environmental Dashboard</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-aqi-secondary" /> {locationName} • Live Data
          </p>
        </div>
        <div className="flex gap-4 hidden sm:flex">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <Cloud className="w-5 h-5 text-gray-300" />
            <span className="text-white font-medium">Real-time</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AQICard currentAQI={aqiData.aqi} />

        <ForecastChart forecastData={forecastData} />
        
        <AQIScaleLegend />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {pollutantsArray.map((p, idx) => (
            <PollutantCard key={idx} {...p} />
          ))}
        </motion.div>

        <MapView coordinates={coordinates} onMapClick={handleMapClick} aqi={aqiData?.aqi || 50} />
      </div>

      <AiChatbot aqiData={aqiData} forecastData={forecastData} locationName={locationName} />
    </div>
  );
}
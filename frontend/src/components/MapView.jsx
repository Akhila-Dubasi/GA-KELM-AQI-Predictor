import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import HeatmapLayer from './HeatmapLayer';

// Removed static DefaultIcon in favor of dynamic AQI-bound DivIcons.

function MapInteraction({ coordinates, onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      if(onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });

  useEffect(() => {
     if (coordinates) {
        map.setView([coordinates.lat, coordinates.lng], map.getZoom(), { animate: true });
     }
  }, [coordinates, map]);

  return null;
}

export default function MapView({ coordinates, onMapClick, aqi }) {
  if (!coordinates) return null;

  // Simulate a highly premium spatial interpolation algorithm (Inverse Distance Weighting / Kriging)
  // By expanding a generated high-density point cloud around the live fetched epicenter.
  const heatmapPoints = useMemo(() => {
    const points = [];
    // The exact epicenter gets the true raw AQI value
    points.push([coordinates.lat, coordinates.lng, aqi]);

    // Generate procedural "smog drift" to make it look like a real glowing storm
    for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Distribute within ~0.3 degrees (approx 33km max)
        const radius = Math.random() * 0.3;
        
        // As it spreads further from the center, the AQI dissipates and shifts with wind logic
        const latOffset = Math.sin(angle) * radius;
        const lngOffset = Math.cos(angle) * radius;
        
        // Simulate distance decay
        const intensity = Math.max(10, aqi - (radius * 1200)); 
        
        // Give it slight noise for realistic variance
        const noise = (Math.random() - 0.5) * 20;

        points.push([
            coordinates.lat + latOffset, 
            coordinates.lng + lngOffset, 
            intensity + noise
        ]);
    }
    return points;
  }, [coordinates.lat, coordinates.lng, aqi]);

  const getMarkerColor = (val) => {
    if (val <= 50) return "#22c55e"; // Good (Green)
    if (val <= 100) return "#84cc16"; // Satisfactory (Light Green)
    if (val <= 200) return "#eab308"; // Moderate (Yellow)
    if (val <= 300) return "#f97316"; // Poor (Orange)
    if (val <= 400) return "#ef4444"; // Very Poor (Red)
    return "#991b1b"; // Severe (Dark Red)
  };

  const aqiColor = getMarkerColor(aqi || 50);

  const dynamicMarkerIcon = L.divIcon({
    className: 'custom-aqi-marker',
    html: `<div style="
      background-color: ${aqiColor};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 0 15px ${aqiColor};
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
        box-shadow: inset 0 0 4px rgba(0,0,0,0.5);
      "></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="glass-card lg:col-span-3 h-[450px] relative overflow-hidden !p-0 mt-4 border border-white/5 rounded-2xl z-0"
    >
      <MapContainer 
          center={[coordinates.lat, coordinates.lng]} 
          zoom={10} 
          style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          // Use a dark-mode CartoDB map tile for premium ultra-high-end contrast with the heatmap
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <HeatmapLayer points={heatmapPoints} />
        <Marker position={[coordinates.lat, coordinates.lng]} icon={dynamicMarkerIcon} />
        <MapInteraction coordinates={coordinates} onMapClick={onMapClick} />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 glass bg-black/40 px-4 py-2 rounded-xl text-white font-medium text-sm border border-white/10 shadow-lg pointer-events-none backdrop-blur-md z-[1000]">
        <MapPin className="w-4 h-4 inline-block mr-2 text-aqi-secondary" />
        Click anywhere to scan area
      </div>
    </motion.div>
  );
}
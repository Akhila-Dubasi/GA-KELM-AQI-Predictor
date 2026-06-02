import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    
    const heatLayer = L.heatLayer(points, {
      radius: 50,
      blur: 40,
      maxZoom: 10,
      max: 500, // Maximum AQI scale
      gradient: {
        0.1: '#22c55e', // Green  (0-50)
        0.2: '#84cc16', // Light Green (50-100)
        0.4: '#eab308', // Yellow (101-200)
        0.6: '#f97316', // Orange (201-300)
        0.8: '#ef4444', // Red    (301-400)
        1.0: '#991b1b'  // Dark Red (401+)
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

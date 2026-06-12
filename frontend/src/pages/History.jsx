import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, RefreshCw, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [locationName, setLocationName] = useState('San Francisco, CA');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
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
    
    setLocationName(name);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/history`, { lat, lng });
      if (res.data) {
         setHistoryData(res.data.historyData);
         setRecentLogs(res.data.recentLogs.map(log => ({ ...log, location: name })));
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch historical data. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-aqi-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center p-8 bg-red-900/20 border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">History Unavailable</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Historical Analysis</h1>
          <p className="text-gray-400">Past 7 days timeline for {locationName}</p>
        </div>
        <div className="flex gap-3">
         
        </div>
      </div>

      {historyData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-aqi-primary" />
              Weekly AQI Trend
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-aqi-secondary border border-white/20" /> Predicted AQI Target
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 border border-white/20" /> PM2.5 Base
              </div>
            </div>
          </div>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAqiHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#a78bfa" strokeWidth={3} fillOpacity={1} fill="url(#colorAqiHistory)" />
                <Area type="monotone" dataKey="pm25" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorPm25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {recentLogs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Analyzed Record Log</h3>
            <button onClick={fetchHistory} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-black/20 border-b border-white/5 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">AQI Value</th>
                  <th className="px-6 py-4 font-medium">Status / Severity</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{log.date}</div>
                      <div className="text-xs">{log.time}</div>
                    </td>
                    <td className="px-6 py-4">{log.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white font-bold text-lg">
                        {log.aqi}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-white/10 ${log.color} bg-black/20`}>
                        <span className={`w-2 h-2 rounded-full bg-current`} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

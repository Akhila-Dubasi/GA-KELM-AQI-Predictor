import { motion } from 'framer-motion';
import { AlertTriangle, ThumbsUp } from 'lucide-react';

export default function AQICard({ currentAQI }) {
  if (currentAQI === undefined || currentAQI === null) return null;

  const getAQIInfo = (aqi) => {
    if (aqi <= 50) return { category: 'Good', color: 'text-green-400', bg: 'bg-green-400/20', icon: <ThumbsUp className="w-8 h-8 text-green-400" />, desc: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' };
    if (aqi <= 100) return { category: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />, desc: 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern.' };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: 'text-orange-400', bg: 'bg-orange-400/20', icon: <AlertTriangle className="w-8 h-8 text-orange-400" />, desc: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.' };
    if (aqi <= 200) return { category: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-400/20', icon: <AlertTriangle className="w-8 h-8 text-red-400" />, desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.' };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-400/20', icon: <AlertTriangle className="w-8 h-8 text-purple-400" />, desc: 'Health alert: everyone may experience more serious health effects.' };
    return { category: 'Hazardous', color: 'text-rose-600', bg: 'bg-rose-600/20', icon: <AlertTriangle className="w-8 h-8 text-rose-600" />, desc: 'Health warnings of emergency conditions. The entire population is more likely to be affected.' };
  };

  const aqiInfo = getAQIInfo(currentAQI);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card lg:col-span-1 relative overflow-hidden flex flex-col items-center justify-center py-12"
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${aqiInfo.bg.replace('/20', '')}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className={`p-6 rounded-full inline-flex ${aqiInfo.bg} mb-6 ring-4 ring-white/5 shadow-[0_0_40px_rgba(250,204,21,0.2)]`}>
        {aqiInfo.icon}
      </div>
      
      <h2 className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-sm">Air Quality Index</h2>
      <div className={`text-7xl font-bold mb-4 ${aqiInfo.color} drop-shadow-lg`}>
        {currentAQI}
      </div>
      
      <div className="px-6 py-2 rounded-full glass border-white/10 mt-2">
        <span className={`font-semibold ${aqiInfo.color}`}>{aqiInfo.category}</span>
      </div>
      
      <p className="text-gray-400 text-sm mt-6 text-center max-w-[85%] border-t border-white/10 pt-4 leading-relaxed">
        {aqiInfo.desc}
      </p>
    </motion.div>
  );
}
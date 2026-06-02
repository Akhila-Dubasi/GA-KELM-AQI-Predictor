import { motion } from 'framer-motion';

export default function PollutantCard({ name, value, unit, status }) {
  // Approximate maximum safe values based on common AQI thresholds for visual scaling
  const maxVals = {
    'PM2.5': 60,
    'PM10': 150,
    'NO2': 100,
    'O3': 100,
    'CO': 15,
    'SO2': 100
  };
  
  const max = maxVals[name] || 100;
  const percentage = Math.min((value / max) * 100, 100);
  const isGood = status === 'Good';

  return (
    <div className="glass-card hover:bg-white/5 !p-4 flex flex-col justify-between h-36 group cursor-pointer relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 z-10">
        <span className="text-gray-400 font-medium text-sm">{name}</span>
        <div className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${isGood ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-500'}`}>
          {status}
        </div>
      </div>
      
      <div className="z-10 mt-auto">
        <div className="flex items-baseline gap-1 break-all mb-3">
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          <span className="text-xs text-gray-500 ml-1">{unit}</span>
        </div>
        
        {/* Progress Bar Track */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${percentage}%` }}
             transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
             className={`h-full rounded-full ${isGood ? 'bg-green-400' : 'bg-yellow-500'}`}
           />
        </div>
      </div>
      
      {/* Subtle Glow Effect */}
      <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-10 pointer-events-none transition-colors duration-700 ${isGood ? 'bg-green-400' : 'bg-yellow-500'}`} />
    </div>
  );
}
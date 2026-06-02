import { Info } from 'lucide-react';

export default function AQIScaleLegend() {
  const levels = [
    { label: 'Good', range: '0-50', color: 'bg-green-400' },
    { label: 'Moderate', range: '51-100', color: 'bg-yellow-400' },
    { label: 'Sensitive', range: '101-150', color: 'bg-orange-400' },
    { label: 'Unhealthy', range: '151-200', color: 'bg-red-400' },
    { label: 'Very Unhealthy', range: '201-300', color: 'bg-purple-400' },
    { label: 'Hazardous', range: '300+', color: 'bg-rose-600' },
  ];

  return (
    <div className="glass-card lg:col-span-3 mt-2 p-6 flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-shrink-0 flex items-center gap-2 text-gray-300">
        <Info className="w-5 h-5" />
        <span className="font-semibold text-sm uppercase tracking-wider">AQI Scale Explained</span>
      </div>
      
      <div className="flex-1 w-full grid grid-cols-3 md:grid-cols-6 gap-2">
        {levels.map((lvl, i) => (
          <div key={i} className="flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity cursor-default">
            <div className={`w-full h-3 rounded-full mb-3 ${lvl.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
            <span className="text-white text-xs font-bold text-center">{lvl.label}</span>
            <span className="text-gray-500 text-[10px] mt-0.5">{lvl.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

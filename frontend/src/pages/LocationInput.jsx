import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LocationInput() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const saveAndNavigate = (lat, lng, name) => {
    localStorage.setItem('aqi_location', JSON.stringify({ lat, lng, name }));
    navigate('/dashboard');
  };

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setErrorMsg('');
    setTimeout(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Get city name via reverse geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const cityName = data.address.city || data.address.town || data.address.village || 'Your Location';
            
            setIsDetecting(false);
            saveAndNavigate(latitude, longitude, cityName);
          } catch (e) {
            setIsDetecting(false);
            saveAndNavigate(latitude, longitude, 'Your Location');
          }
        },
        (error) => {
          setIsDetecting(false);
          setErrorMsg('Failed to detect location. Please allow location permissions or search manually.');
        }
      );
    } else {
      setIsDetecting(false);
      setErrorMsg('Geolocation is not supported by your browser.');
    }
    }, 500); // short delay for visual feedback
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setErrorMsg('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        // Display name can be long, take first part
        const shortName = display_name.split(',')[0];
        saveAndNavigate(parseFloat(lat), parseFloat(lon), shortName);
      } else {
        setErrorMsg('Location not found. Try a different search term.');
      }
    } catch (e) {
      setErrorMsg('Error searching for location.');
    }
  };

  const handleRecent = (city) => {
    setSearchQuery(city);
    // Optionally trigger search immediately
  };

  const recentSearches = ['San Francisco', 'New York', 'London', 'Tokyo'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="inline-block p-4 rounded-full bg-aqi-primary/10 mb-6">
          <MapPin className="w-10 h-10 text-aqi-primary" />
        </span>
        <h1 className="text-4xl font-bold text-white mb-4">Set Your Location</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Enter your city manually or allow us to detect your current location for real-time air quality updates in your area.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card max-w-2xl mx-auto"
      >
        <form onSubmit={handleSearch} className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-24 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aqi-primary focus:border-transparent transition-all sm:text-lg"
            placeholder="Search for a city or zip code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute inset-y-2 right-2 px-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Search
          </button>
        </form>

        {errorMsg && (
          <p className="text-red-400 text-sm text-center mb-4">{errorMsg}</p>
        )}

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl border border-aqi-primary/30 text-aqi-primary hover:bg-aqi-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-aqi-primary focus:ring-opacity-50"
        >
          {isDetecting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              Detecting...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              Use Current Location
            </>
          )}
        </button>

        <div className="mt-10">
          <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <HistoryIcon className="w-4 h-4" /> Suggested Locations
          </h3>
          <div className="flex flex-wrap gap-3">
            {recentSearches.map((city) => (
              <button
                key={city}
                onClick={() => handleRecent(city)}
                className="px-4 py-2 rounded-full glass border border-white/5 text-gray-300 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2"
              >
                <Crosshair className="w-3 h-3 text-aqi-light" />
                {city}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HistoryIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

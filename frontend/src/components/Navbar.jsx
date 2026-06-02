import { Link, useLocation } from 'react-router-dom';
import { Wind, LayoutDashboard, History, MapPin, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Location', path: '/location', icon: MapPin },
    { name: 'History', path: '/history', icon: History },
    { name: 'Safety', path: '/precautions', icon: ShieldCheck },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-aqi-primary/20 rounded-xl group-hover:bg-aqi-primary/30 transition-colors">
              <Wind className="w-6 h-6 text-aqi-light" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-aqi-light group-hover:to-aqi-secondary transition-all">
              AeroSense
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-1 border border-white/10 rounded-full p-1 bg-black/20">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/10 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
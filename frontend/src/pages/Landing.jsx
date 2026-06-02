import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Wind, Activity, Globe } from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-aqi-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-aqi-secondary/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-aqi-light text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqi-light opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aqi-light"></span>
            </span>
            Real-time Air Quality Prediction System
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Breathe <span className="text-gradient">Smarter,</span> <br className="hidden md:block"/>
            Live <span className="text-gradient">Better.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
            Advanced machine learning predicts the Air Quality Index for your city.
            Stay informed with real-time pollution metrics and make healthier decisions.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-bg-aqi-bg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors pointer-events-auto text-black">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/location" className="w-full sm:w-auto px-8 py-4 rounded-xl glass font-semibold text-lg flex items-center justify-center hover:bg-white/5 transition-colors pointer-events-auto text-white">
              Check My Area
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32"
        >
          <FeatureCard 
            icon={<Wind className="w-8 h-8 text-aqi-light" />}
            title="Real-time Tracking"
            description="Live API data integration for up-to-the-minute AQI metrics."
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-aqi-primary" />}
            title="ML Predictions"
            description="Forecasting based on historical trends and current meteorological data."
          />
          <FeatureCard 
            icon={<Globe className="w-8 h-8 text-aqi-secondary" />}
            title="Global Coverage"
            description="Search for any city or use automated location detection."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      className="glass-card flex flex-col items-center text-center group"
    >
      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

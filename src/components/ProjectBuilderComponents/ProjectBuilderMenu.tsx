import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/theme'; // Import the theme store

const ProjectBuilderMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showStoreModal, setShowStoreModal] = useState(false);

  // --- Theme Integration Start ---
  const theme = useThemeStore((state) => state.getThemeStyles());
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || '';
  // --- Theme Integration End ---


  // Removed the useEffect that was causing infinite navigation loops
  // The routing is now handled by App.tsx with separate routes for software and science

  const handleViewSelect = (view: 'software' | 'science') => {
    navigate(`/project-builder/${view}`);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 container mx-auto px-4 py-4 flex flex-col items-center min-h-screen text-center text-white">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => (window.location.href = '/explore-menu')}
          className="flex items-center gap-2 px-4 py-2 mb-4 self-start bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        {/* Hero Section with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
          >
            Build Your
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              {' Future'}
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl drop-shadow-lg"
        >
          Explore innovative software and science projects. Learn, create, and innovate with AI guidance and expert tutorials.
        </motion.p>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col md:flex-row gap-6 mb-8"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: 5,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewSelect('software')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-lg font-semibold border border-blue-500/20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🚀 Software Projects
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: -5,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewSelect('science')}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-lg font-semibold border border-green-500/20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🔬 Science Projects
          </motion.button>
        </motion.div>

        {/* Enhanced Utility Buttons */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1 }}
  className="flex items-center gap-4 justify-center"
>
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => setShowStoreModal(true)}
    className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
  >
    <ShoppingCart size={24} />
  </motion.button>
</motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-white">25+</div>
            <div className="text-blue-100">Projects</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-white">AI</div>
            <div className="text-blue-100">Powered</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-white">Learn</div>
            <div className="text-blue-100">By Doing</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectBuilderMenu;
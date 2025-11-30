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

  // 🔥 PRELOAD ALL BACKGROUND IMAGES — FIXES THE FLICKER
  useEffect(() => {
    if (theme.backgrounds) {
      theme.backgrounds.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [theme.backgrounds]);

  // 🎯 CAROUSEL INTERVAL - 20 SECONDS (Matching ExploreMenu)
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 20000); // Changed to 20000ms (20 seconds)
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);
  // --- Theme Integration End ---


  // Removed the useEffect that was causing infinite navigation loops
  // The routing is now handled by App.tsx with separate routes for software and science

  const handleViewSelect = (view: 'software' | 'science') => {
    navigate(`/project-builder/${view}`);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
    >
      
      {/* 🔥 SEAMLESS CROSSFADE - NO BLACK SCREEN (New Background Logic) */}
      <div className="absolute inset-0 overflow-hidden">
        {theme.backgrounds?.map((bg, index) => (
          <motion.div
            key={bg}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bg})`,
              zIndex: index === currentBackgroundIndex ? 10 : 0,
              backgroundAttachment: 'fixed',
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentBackgroundIndex ? 1 : 0 
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut" 
            }}
          />
        ))}
      </div>

      {/* Background Overlay (UPDATED: Deeper, cosmic gradient overlay + blur) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-20"></div>

      <div className="relative z-30 container mx-auto px-4 py-4 flex flex-col items-center min-h-screen text-center text-white">
        {/* Back Button (UPDATED: Glassmorphic with Neon Border) */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => (window.location.href = '/explore-menu')}
          className="flex items-center gap-2 px-4 py-2 mb-8 self-start bg-black/40 backdrop-blur-lg text-white rounded-full hover:bg-white/10 transition-all duration-300 border border-indigo-500/30 hover:border-cyan-400/50 shadow-lg"
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
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
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
              // Enhanced text glow effect
              className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,0,150,0.5)]"
            >
              {' Future'}
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl drop-shadow-xl"
        >
          Explore innovative software and science projects. Learn, create, and innovate with AI guidance and expert tutorials.
        </motion.p>

        {/* Enhanced Action Buttons (UPDATED: Neon Glow & 3D Lift) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col md:flex-row gap-8 mb-10"
        >
          <motion.button
            whileHover={{
              scale: 1.08, // More pronounced lift
              rotateX: 5,
              rotateY: 5,
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)", // Stronger shadow
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewSelect('software')}
            // Neon Gradient Button Style
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-2xl shadow-blue-500/30 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 text-xl font-bold border border-blue-400/50"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🚀 Software Projects
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.08, // More pronounced lift
              rotateX: 5,
              rotateY: -5,
              boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.4)", // Stronger shadow
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewSelect('science')}
            // Neon Gradient Button Style
            className="px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-2xl shadow-green-500/30 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 text-xl font-bold border border-green-400/50"
            style={{ transformStyle: 'preserve-3d' }}
          >
            🔬 Science Projects
          </motion.button>
        </motion.div>

        {/* Enhanced Utility Buttons (UPDATED: Glassmorphic with Neon Glow) */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1 }}
  className="flex items-center gap-4 justify-center mb-16"
>
  <motion.button
    whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
    whileTap={{ scale: 0.9 }}
    onClick={() => setShowStoreModal(true)}
    // Glassmorphic Utility Button
    className="p-4 bg-black/40 backdrop-blur-lg rounded-full text-white hover:bg-white/10 transition-all duration-300 border border-white/20 shadow-lg"
  >
    <ShoppingCart size={24} />
  </motion.button>
</motion.div>

        {/* Stats Section (UPDATED: Glassmorphic Cards with Neon Hover) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, staggerChildren: 0.1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
            // Glassmorphic Card Style
            className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10 transition-all duration-300 cursor-default shadow-xl"
          >
            <div className="text-4xl mb-2 text-cyan-400">📚</div>
            <div className="text-3xl font-bold text-white">25+</div>
            <div className="text-blue-200">Projects</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)" }}
            // Glassmorphic Card Style
            className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10 transition-all duration-300 cursor-default shadow-xl"
          >
            <div className="text-4xl mb-2 text-purple-400">🤖</div>
            <div className="text-3xl font-bold text-white">AI</div>
            <div className="text-blue-200">Powered</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)" }}
            // Glassmorphic Card Style
            className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10 transition-all duration-300 cursor-default shadow-xl"
          >
            <div className="text-4xl mb-2 text-pink-400">🎯</div>
            <div className="text-3xl font-bold text-white">Learn</div>
            <div className="text-blue-200">By Doing</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectBuilderMenu;
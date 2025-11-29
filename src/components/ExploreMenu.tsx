// ExploreMenu.tsx (Updated with 60% black glassmorphic cards and neon blue shadows)
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Trophy, 
  Award, 
  PenTool, 
  ArrowLeft,
  Brain,
  UserCircle,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, themeConfig } from '../store/theme';
import AccountModal from './modals/AccountModal';
import { auth } from '../lib/firebase';

// Use backend URL
const VITE_BACKEND_URL = 'http://localhost:5001';

export const ExploreMenu = () => {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.getThemeStyles());
  const setTheme = useThemeStore((state) => state.setTheme);
  const setDynamicBackgrounds = useThemeStore((state) => state.setDynamicBackgrounds);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user profile
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profileImage || '');

          if (data.interests) setTheme(data.interests);
          if (data.generatedThemeImages?.length > 0) {
            const baseUrl = VITE_BACKEND_URL || '';
            const fullUrls = data.generatedThemeImages.map((img) => {
              if (img.startsWith('http')) return img;
              return baseUrl + (img.startsWith('/') ? img : '/' + img);
            });
            setDynamicBackgrounds(fullUrls);
          }
        }
      } catch (error) {
        console.error("Profile load failed:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 🔥 PRELOAD ALL BACKGROUND IMAGES — FIXES THE FLICKER
  useEffect(() => {
    if (theme.backgrounds) {
      theme.backgrounds.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [theme.backgrounds]);

  // 🎯 CAROUSEL INTERVAL - 30 SECONDS
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 30000); // ✅ LINE 77: 30 SECONDS - CHANGE THIS NUMBER FOR DIFFERENT TIMING
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const handleProfileUpdate = () => fetchUserProfile();

  const menuItems = [
    { title: 'Subjects', description: 'Explore various subjects and expand your knowledge', icon: Brain, path: '/subjects', color: 'from-indigo-400 to-indigo-600' },
    { title: 'English Skill Build', description: 'Ask curious questions and explore amazing possibilities', icon: Star, path: '/what-if', color: 'from-green-400 to-green-600' },
    { title: 'AI Study Planner', description: 'Create personalized study plans with AI assistance', icon: Brain, path: '/ai-study-planner', color: 'from-blue-400 to-blue-600' },
    { title: 'Progress Adventure', description: 'Track your learning journey on an interactive map', icon: Trophy, path: '/progress', color: 'from-purple-400 to-purple-600' },
    { title: 'Coding Hub', description: 'Discover exciting future careers and opportunities', icon: Award, path: '/codinghub', color: 'from-red-400 to-red-600' },
    { title: 'Project Builder', description: 'Create your own amazing learning projects', icon: PenTool, path: '/create', color: 'from-orange-400 to-orange-600' }
  ];

  const handleChangeTheme = useCallback(async (newTheme) => {
    setIsThemeSelectorOpen(false);
    setIsGenerating(true);

    try {
      const genRes = await fetch(`${VITE_BACKEND_URL}/api/generate-theme-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
      const data = await genRes.json();

      if (genRes.ok) {
        setTheme(newTheme);
        const baseUrl = VITE_BACKEND_URL || '';
        const processed = data.imageIds.map((id) => `${baseUrl}/api/images/${id}`);

        setDynamicBackgrounds(processed);

        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          await fetch(`${VITE_BACKEND_URL}/api/user/${user.uid}/learning-style`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              learningStyle: 'visual',
              interests: newTheme,
              generatedThemeImages: processed,
            }),
          });
        }
      }
    } catch (err) {
      console.error("Theme gen error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const LoadingSpinner = () => (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Star className="w-16 h-16 text-yellow-500" />
      </motion.div>
    </div>
  );

  const profileImageSrc = (() => {
    if (!profileImageUrl) return null;
    if (profileImageUrl.startsWith('data:image/')) return profileImageUrl;
    if (profileImageUrl.startsWith('/uploads/')) return `${VITE_BACKEND_URL}${profileImageUrl}`;
    if (profileImageUrl.startsWith('http')) return profileImageUrl;
    return null;
  })();

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">

      {/* 🔥 SEAMLESS CROSSFADE - NO BLACK SCREEN */}
      <div className="absolute inset-0 overflow-hidden">
        {theme.backgrounds?.map((bg, index) => (
          <motion.div
            key={bg}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bg})`,
              zIndex: index === currentBackgroundIndex ? 10 : 0
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

      {/* Black overlay - z-20 to stay above backgrounds */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-20"></div>

      {isGenerating && <LoadingSpinner />}

      <div className="relative max-w-6xl mx-auto z-30">
        <div className="flex justify-between items-center mb-8 relative">

          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center 
                       shadow-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>

          <div className="flex items-center gap-4 ml-auto">

            <button
              onClick={() => setIsThemeSelectorOpen(true)}
              className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:from-purple-800 hover:to-indigo-800 transition-all duration-300 hover:scale-[1.02]"
            >
              <Palette size={20} />
              Change Theme
            </button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAccountModalOpen(true)}
              className="relative w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center overflow-hidden"
            >
              <div
                className="absolute inset-[-100%] w-[300%] h-[300%] animate-spin"
                style={{
                  animationDuration: '8s',
                  backgroundImage: `conic-gradient(
                    from 0deg, 
                    #FF0000 0deg 60deg, 
                    #FFFF00 60deg 120deg, 
                    #00FF00 120deg 180deg, 
                    #E0115F 180deg 240deg, 
                    #0000FF 240deg 300deg, 
                    #800000 300deg 360deg  
                  )`
                }}
              ></div>

              <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center z-10">
                {profileImageSrc ? (
                  <img src={profileImageSrc} className="w-11 h-11 rounded-full object-cover" />
                ) : (
                  <UserCircle size={28} className="text-white w-11 h-11" />
                )}
              </div>
            </motion.button>

          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Learning Adventure
          </h1>
          <p className="text-xl text-white text-opacity-90">
            Explore different ways to learn and grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                rotate: -1,
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.8)`
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 cursor-pointer border border-cyan-500/30"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10 group-hover:from-black/30 group-hover:to-black/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur rounded-full p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white text-opacity-90">{item.description}</p>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur rounded-full p-2">
                    <ArrowLeft className="w-6 h-6 text-white rotate-180" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {isThemeSelectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsThemeSelectorOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 rounded-2xl p-8 shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Change Theme
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Select a new interest to explore new worlds!
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.keys(themeConfig).map((themeName, i) => {
                  const isActive = themeName === useThemeStore.getState().theme;
                  const gradients = [
                    "from-indigo-500 via-purple-500 to-pink-500",
                    "from-green-400 via-emerald-500 to-teal-500",
                    "from-blue-400 via-cyan-500 to-sky-500",
                    "from-red-500 via-pink-500 to-orange-500",
                    "from-yellow-400 via-amber-500 to-orange-400",
                    "from-fuchsia-500 via-purple-500 to-indigo-500"
                  ];
                  const gradient = gradients[i % gradients.length];

                  return (
                    <motion.button
                      key={themeName}
                      whileHover={{ scale: 1.08, rotate: 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChangeTheme(themeName)}
                      className={`relative p-6 rounded-2xl font-bold text-center text-white transition-all duration-300
                        bg-gradient-to-br ${gradient}
                        shadow-lg hover:shadow-xl hover:shadow-purple-500/40
                        ${isActive ? "ring-4 ring-yellow-400" : ""}`}
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl opacity-0 hover:opacity-100 transition-all"></div>
                      <span className="relative text-lg">
                        {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                      </span>
                      {isActive && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                          Active
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setIsThemeSelectorOpen(false)}
                  className="text-gray-500 font-semibold hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExploreMenu;
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

  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Get the token first
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profileImage || '');
          if (data.interests) {
            setTheme(data.interests as keyof typeof themeConfig);
          }
          if (data.generatedThemeImages && data.generatedThemeImages.length > 0) {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
            const fullUrls = data.generatedThemeImages.map((img: string) => {
              if (img.startsWith('http') || img.startsWith('https')) {
                return img;
              }
              return baseUrl + (img.startsWith('/') ? img : '/' + img);
            });
            setDynamicBackgrounds(fullUrls);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile for menu icon:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const handleProfileUpdate = () => {
    fetchUserProfile();
  };

  const menuItems = [
    {
      title: 'Subjects',
      description: 'Explore various subjects and expand your knowledge',
      icon: Brain,
      path: '/subjects',
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      title: 'English Skill Build',
      description: 'Ask curious questions and explore amazing possibilities',
      icon: Star,
      path: '/what-if',
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'AI Study Planner',
      description: 'Create personalized study plans with AI assistance',
      icon: Brain,
      path: '/ai-study-planner',
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Progress Adventure',
      description: 'Track your learning journey on an interactive map',
      icon: Trophy,
      path: '/progress',
      color: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Coding Hub',
      description: 'Discover exciting future careers and opportunities',
      icon: Award,
      path: '/codinghub',
      color: 'from-red-400 to-red-600'
    },
    {
      title: 'Project Builder',
      description: 'Create your own amazing learning projects',
      icon: PenTool,
      path: '/create',
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || '';

  const handleChangeTheme = useCallback(async (newTheme: string) => {
    setIsThemeSelectorOpen(false);
    setIsGenerating(true);

    try {
      const generateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-theme-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
      const data = await generateResponse.json();

      if (generateResponse.ok) {
        setTheme(newTheme as keyof typeof themeConfig);
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const processedBackgrounds = data.backgrounds.map((img: string) => {
          if (img.startsWith('http') || img.startsWith('https')) {
            return img;
          }
          return baseUrl + (img.startsWith('/') ? img : '/' + img);
        });
        setDynamicBackgrounds(processedBackgrounds);

        const user = auth.currentUser;
        if (user) {
          // Get token for the save request
          const token = await user.getIdToken();
          const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}/learning-style`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Add token here
            },
            body: JSON.stringify({
              learningStyle: 'visual', // You may want to fetch the current learning style instead of hardcoding
              interests: newTheme,
              generatedThemeImages: processedBackgrounds,
            }),
          });
          if (!saveResponse.ok) {
            console.error('Failed to save theme to database.');
          }
        }
      } else {
        console.error('Failed to generate new theme images:', data.error);
        alert('Failed to generate new theme images.');
      }
    } catch (error) {
      console.error('Network or API error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [setTheme, setDynamicBackgrounds]);

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

  return (
    <div 
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"></div>
      
      {isGenerating && <LoadingSpinner />}
      
      <div className="relative max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative">
          {/* START: Back Button - Designed like the image */}
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center 
                       shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
            title="Go Back"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          {/* END: Back Button */}
          
          <div className="flex items-center gap-4 ml-auto">
            
            {/* START: Change Theme Button - Reverted to Dark Gradient Style */}
            <button
              onClick={() => setIsThemeSelectorOpen(true)}
              className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:from-purple-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Palette size={20} />
              Change Theme
            </button>
            {/* END: Change Theme Button */}

            {/* START: Account Button with Perfectly Round, Segmented, Rotating Border */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAccountModalOpen(true)}
              // The main wrapper for size and shape
              className="relative w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center overflow-hidden"
              title="My Account"
            >
              {/* Spinning Segmented Gradient Element */}
              <div 
                // Using conic-gradient via style for segmented color stops (6 colors / 6 = 60 degrees per color)
                className="absolute inset-[-100%] w-[300%] h-[300%] animate-spin"
                style={{ 
                  animationDuration: '8s', 
                  backgroundImage: `conic-gradient(
                    from 0deg, 
                    #FF0000 0deg 60deg,  /* Red */
                    #FFFF00 60deg 120deg, /* Yellow */
                    #00FF00 120deg 180deg, /* Green */
                    #E0115F 180deg 240deg, /* Ruby */
                    #0000FF 240deg 300deg, /* Blue */
                    #800000 300deg 360deg  /* Burgundy */
                  )`
                }}
              ></div>

              {/* Inner Circle (Very Dark) for the actual profile picture/icon */}
              {/* This circle is slightly smaller to create the border effect around it */}
              <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center z-10">
                {profileImageUrl ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${profileImageUrl}`}
                    alt="Profile"
                    className="w-11 h-11 rounded-full object-cover" 
                  />
                ) : (
                  // Placeholder icon inside the dark ring
                  <UserCircle size={28} className="text-white w-11 h-11" />
                )}
              </div>
            </motion.button>
            {/* END: Account Button with Perfectly Round, Segmented, Rotating Border */}
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
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 group-hover:from-black/70 group-hover:to-black/50 transition-all duration-300"></div>
              <div className="relative p-8">
                <div className="bg-white/20 backdrop-blur rounded-full p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white text-opacity-90">{item.description}</p>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur rounded-full p-2">
                    <ArrowLeft className="w-6 h-6 text-white transform rotate-180" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Account Modal */}
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onProfileUpdate={handleProfileUpdate} />

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
              <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">Change Theme</h3>
              <p className="text-gray-600 text-center mb-6">Select a new interest to explore new worlds!</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.keys(themeConfig).map((themeName, index) => {
                  const isActive = themeName === useThemeStore.getState().theme;
                  const gradients = [
                    "from-indigo-500 via-purple-500 to-pink-500",
                    "from-green-400 via-emerald-500 to-teal-500",
                    "from-blue-400 via-cyan-500 to-sky-500",
                    "from-red-500 via-pink-500 to-orange-500",
                    "from-yellow-400 via-amber-500 to-orange-400",
                    "from-fuchsia-500 via-purple-500 to-indigo-500"
                  ];
                  const gradient = gradients[index % gradients.length];
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
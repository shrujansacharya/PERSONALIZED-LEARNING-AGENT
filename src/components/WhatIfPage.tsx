import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, MessageSquare, Mic, Award, Star, Trophy, ArrowLeft, PenSquare, Flame, Zap, Sparkles, Coffee, Target, Volume2, Users, Mic2, MessageCircle, Book, Volume, Play, Pause, Globe, Headphones, Lightbulb, Heart, ChevronRight, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { doc, getDoc } from 'firebase/firestore';

// Mock Firebase for local development
const auth = {
  currentUser: null as { uid: string } | null
};
const db = {} as any;

export const WhatIfPage = () => {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.getThemeStyles());
  const [profile, setProfile] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [lockedChallenges, setLockedChallenges] = useState<{[key: string]: boolean}>({});
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<{ [key: string]: boolean }>({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Fallback profile data
  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    points: 1250,
    streak: 5,
    completed_activities: [],
    progress: { vocabulary: 0.8, grammar: 0.5, conversation: 0, pronunciation: 0.2, reading: 1, writing: 0.7 },
    badges: []
  };
  
  // 🔥 PRELOAD ALL BACKGROUND IMAGES — FIXES THE FLICKER (Copied from ExploreMenu)
  useEffect(() => {
    if (theme.backgrounds) {
      theme.backgrounds.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [theme.backgrounds]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    fetchProfile();
    checkLockedChallenges();

    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      // 🎯 CAROUSEL INTERVAL - 20 SECONDS (Matching ExploreMenu)
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 20000); // Updated to 20000ms
      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [theme.backgrounds]);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      } else {
        setProfile(fallbackProfile);
      }
    } else {
      setProfile(fallbackProfile);
    }
  };

  const checkLockedChallenges = () => {
    const today = new Date().toDateString();
    const locked: {[key: string]: boolean} = {};
    const challengeTypes = ['grammar', 'reading', 'writing', 'pronunciation'];
    challengeTypes.forEach(type => {
      const completionKey = `${type}-completed-${today}`;
      const attemptKey = `${type}-attempts-${today}`;
      const completed = localStorage.getItem(completionKey) === 'true';
      const attempts = localStorage.getItem(attemptKey);
      const attemptCount = attempts ? JSON.parse(attempts).attempts : 0;
      locked[type] = completed || attemptCount >= 2;
    });
    setLockedChallenges(locked);
  };
  
  const challengeDefinitions = [
    { id: 'grammar', title: 'Grammar', description: 'Master rules with engaging exercises.', icon: BookOpen, color: 'from-purple-500 to-indigo-600', route: '/grammar', progressKey: 'grammar' },
    { id: 'reading', title: 'Reading', description: 'Improve comprehension with passages.', icon: BookOpen, color: 'from-green-500 to-teal-600', route: '/reading-challenge', progressKey: 'reading' },
    { id: 'writing', title: 'Writing', description: 'Enhance skills with AI feedback.', icon: PenSquare, color: 'from-blue-500 to-cyan-600', route: '/writing', progressKey: 'writing' },
    { id: 'pronunciation', title: 'Pronunciation', description: 'Perfect your accent with speech analysis.', icon: Mic, color: 'from-red-500 to-pink-600', route: '/pronunciation', progressKey: 'pronunciation' },
  ];

  const completedCount = Object.values(lockedChallenges).filter(locked => locked).length;
  const totalChallenges = challengeDefinitions.length;
  const allCompleted = completedCount === totalChallenges;

  const getLevelName = (grade: string) => {
    switch (grade) {
      case '4-6': return 'Beginner';
      case '7-9': return 'Intermediate';
      case '10-12': return 'Advanced';
      default: return 'Beginner';
    }
  };

  const handleNavigate = (route: string, state?: any) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(route, { state });
      setIsLoading(false);
    }, 800);
  };

  const levelConfigs = {
    Beginner: { icon: MessageCircle, description: 'Basic phrases and simple conversations.', color: 'from-blue-500 to-cyan-500', badge: 'Starter', accent: 'blue' },
    Intermediate: { icon: Users, description: 'Everyday discussions and opinions.', color: 'from-green-500 to-emerald-500', badge: 'Pro', accent: 'green' },
    Advanced: { icon: Volume2, description: 'Complex debates and presentations.', color: 'from-purple-500 to-violet-500', badge: 'Master', accent: 'purple' }
  };

  const speakingProgress = ((profile?.progress?.conversation || 0) + (profile?.progress?.pronunciation || 0)) / 2;

  const togglePreview = (modeKey: string) => {
    setIsPreviewPlaying(prev => ({ ...prev, [modeKey]: !prev[modeKey] }));
    setTimeout(() => {
      setIsPreviewPlaying(prev => ({ ...prev, [modeKey]: false }));
    }, 2000);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden text-white font-sans"
    >
      
      {/* 🔥 SEAMLESS CROSSFADE - NO BLACK SCREEN (New Background Logic - z-0/z-10) */}
      <div className="absolute inset-0 overflow-hidden">
        {theme.backgrounds?.map((bg, index) => (
          <motion.div
            key={bg}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bg})`,
              zIndex: index === currentBackgroundIndex ? 10 : 0, // Active: z-10, Inactive: z-0
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

      {/* Advanced Background Layers (UPDATED: Deeper, cosmic gradient overlay + blur) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-sm z-20"></div>
      <motion.div 
        className="absolute inset-0 z-20"
        animate={{ 
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147,51,234,0.3) 0%, transparent 50%)`
        }}
        transition={{ duration: 0.3 }}
      />
      {/* Grid pattern retained for visual texture */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 z-20"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-20"></div>
      
      {/* Main Content (Updated z-index to z-30 to be above overlays) */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 relative z-30 space-y-12">
        {/* Advanced Header with Profile */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <motion.button
            onClick={() => navigate('/explore-menu')}
            // UPDATED: Glassmorphic button, neon hover border
            className="flex items-center gap-3 text-white/70 hover:text-cyan-400 transition-all duration-300 p-4 rounded-2xl bg-black/40 backdrop-blur-lg border border-indigo-400/30 hover:bg-white/10 hover:border-cyan-400/50 shadow-lg"
            whileHover={{ scale: 1.05, rotate: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} />
            <span className="text-sm font-medium hidden md:inline">Explore</span>
          </motion.button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                // UPDATED: Glassmorphic select
                className="px-6 py-3 text-sm rounded-2xl bg-black/40 text-white border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-lg appearance-none bg-no-repeat bg-right pr-10 shadow-lg"
              >
                <option value="4-6">4-6 (Beginner)</option>
                <option value="7-9">7-9 (Intermediate)</option>
                <option value="10-12">10-12 (Advanced)</option>
              </select>
              <ChevronRight size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>

            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              // UPDATED: Glassmorphic button, neon hover border
              className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 backdrop-blur-lg border border-indigo-400/30 hover:bg-white/10 hover:border-pink-400/50 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <User size={24} className="text-white" />
              <span className="text-sm font-medium">{profile?.username || 'Student'}</span>
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  // UPDATED: Glassmorphic menu
                  className="absolute top-full right-0 mt-2 w-48 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
                >
                  <div className="p-4 space-y-2">
                    <motion.button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
                      <Settings size={20} />
                      <span className="text-sm">Settings</span>
                    </motion.button>
                    <motion.button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
                      <Star size={20} />
                      <span className="text-sm">Badges ({profile?.badges?.length || 0})</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent"
            initial={{ scale: 0.8, rotateX: -90 }}
            animate={{ scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            Speak <span className="text-5xl">Like</span> a Pro
          </motion.h1>
          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Elevate your English with cutting-edge AI conversations. Choose your path and let the magic unfold.
          </p>
        </motion.div>

        {/* Advanced Dashboard */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div 
            // UPDATED: Glassmorphic panel, subtle neon border/shadow
            className="lg:col-span-3 relative overflow-hidden bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20 group"
            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(168,85,247,0.3)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center gap-6 mb-8">
              <motion.div 
                className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Target size={32} className="text-black" />
              </motion.div>
              <div>
                <h3 className="text-3xl font-bold">Mastery Dashboard</h3>
                <p className="text-white/60">Your journey at a glance</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div className="text-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10" whileHover={{ y: -5, scale: 1.05, boxShadow: "0 10px 20px rgba(255,193,7,0.2)" }}>
                <Star size={32} className="mx-auto mb-3 text-yellow-400" />
                <p className="text-3xl font-bold">{profile?.points || 0}</p>
                <span className="text-white/60">Points Earned</span>
              </motion.div>
              <motion.div className="text-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10" whileHover={{ y: -5, scale: 1.05, boxShadow: "0 10px 20px rgba(255,87,34,0.2)" }}>
                <Flame size={32} className="mx-auto mb-3 text-orange-400" />
                <p className="text-3xl font-bold">{profile?.streak || 0}</p>
                <span className="text-white/60">Day Streak</span>
              </motion.div>
              <motion.div className="text-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl md:col-span-1 border border-white/10" whileHover={{ y: -5, scale: 1.05, boxShadow: "0 10px 20px rgba(76,175,80,0.2)" }}>
                <div className="w-full bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalChallenges) * 100}%` }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
                <p className="text-lg font-bold">{completedCount}/{totalChallenges}</p>
                <span className="text-white/60">Challenges</span>
              </motion.div>
            </div>
            {allCompleted && (
              <motion.div 
                className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-green-500/40"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Trophy size={20} className="inline mr-2" /> All Conquered!
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            // UPDATED: Glassmorphic panel, subtle neon border/shadow
            className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/30 shadow-2xl shadow-pink-500/20 flex flex-col items-center justify-center text-center"
            whileHover={{ scale: 1.02, rotateY: 3, boxShadow: "0 20px 40px -10px rgba(236,72,153,0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <Lightbulb size={48} className="text-yellow-400 mb-4 drop-shadow-lg" />
            <h4 className="text-2xl font-bold mb-3">Pro Tip</h4>
            <p className="text-white/70">Record yourself speaking to track improvement over time.</p>
          </motion.div>
        </motion.div>

        {/* Ultra-Advanced Speaking Section */}
        <section className="space-y-12">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Voice <span className="text-4xl">Revolution</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">AI-driven speaking mastery. Select your level and dive into immersive practice modes.</p>
            <div 
              // UPDATED: Glassmorphic progress bar container
              className="mt-8 max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-cyan-400/30 shadow-lg shadow-cyan-400/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-white/70 font-medium">Fluency Score</span>
                <div className="flex-1 mx-6 bg-white/10 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${speakingProgress * 100}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </motion.div>
                </div>
                <span className="text-2xl font-bold text-purple-300">{Math.round(speakingProgress * 100)}%</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sleek Level Selector */}
            <motion.div 
              // UPDATED: Glassmorphic selector container
              className="lg:col-span-1 bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 shadow-2xl shadow-pink-500/20"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(236,72,153,0.3)" }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl">
                  <Book size={24} />
                </div>
                <label className="text-2xl font-bold">Level Up</label>
              </div>
              <div className="space-y-4">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                  const config = levelConfigs[level as keyof typeof levelConfigs];
                  const isSelected = currentLevel === level;
                  return (
                    <motion.button
                      key={level}
                      onClick={() => setCurrentLevel(level)}
                      // UPDATED: Glassmorphic non-selected buttons
                      className={`relative w-full p-6 rounded-2xl text-left transition-all duration-500 overflow-hidden group ${isSelected ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-pink-600/30 ring-2 ring-purple-400/30' : 'bg-black/40 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:shadow-xl'}`}
                      whileHover={isSelected ? { scale: 1.02 } : { scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                      <div className="relative flex items-center gap-4">
                        <motion.div 
                          // UPDATED: Glassmorphic icon container
                          className={`p-4 rounded-2xl ${isSelected ? 'bg-white/20' : 'bg-black/40 backdrop-blur-sm'}`}
                        >
                          <config.icon size={32} className={isSelected ? 'text-white' : 'text-white/60'} />
                        </motion.div>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{level}</div>
                          <div className="text-sm text-white/70">{config.description}</div>
                        </div>
                        {isSelected && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <Sparkles size={24} className="text-yellow-300" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Immersive Practice Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Guided Odyssey', 
                  description: 'Navigate structured dialogues with real-time feedback.', 
                  icon: Headphones, 
                  route: '/guided-practice', 
                  color: 'from-blue-500 to-indigo-600',
                  preview: 'AI-guided stories',
                  key: 'guided'
                },
                { 
                  title: 'Echo Mastery', 
                  description: 'Hone pronunciation through adaptive repetition drills.', 
                  icon: Mic2, 
                  route: '/sentence-practice', 
                  color: 'from-green-500 to-emerald-600',
                  preview: 'Instant analysis',
                  key: 'sentence'
                },
                { 
                  title: 'Infinite Dialogue', 
                  description: 'Engage in boundless, context-aware conversations.', 
                  icon: Coffee, 
                  route: '/casual', 
                  color: 'from-purple-500 to-violet-600',
                  preview: 'Personalized chats',
                  key: 'casual'
                },
              ].map((mode, index) => {
                const isPlaying = isPreviewPlaying[mode.key];
                return (
                  <motion.div
                    key={mode.title}
                    initial={{ opacity: 0, y: 50, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    onClick={() => handleNavigate(mode.route, { level: currentLevel })}
                    // UPDATED: Glassmorphic card base, explicit neon shadow
                    className={`group relative overflow-hidden bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-700 h-full ${mode.color.replace('from-', 'text-')}`}
                    whileHover={{ y: -15, rotateX: 5, rotateY: 5, boxShadow: `0 25px 50px -12px ${mode.color.split(' ')[1] || '#8b5cf6'}30` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* 3D Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent -z-10"></div>
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                      animate={isPlaying ? { opacity: 0.4 } : {}
                    }
                    />
                    
                    {/* Icon with Glow */}
                    <motion.div 
                      // UPDATED: Glassmorphic icon container
                      className="relative z-10 p-6 bg-black/40 backdrop-blur-sm rounded-3xl mx-auto mb-6 group-hover:bg-white/20 transition-all"
                      style={{ boxShadow: isPlaying ? `0 0 30px ${mode.color.split(' ')[1] || '#8b5cf6'}` : 'none' }}
                    >
                      <mode.icon size={48} className="drop-shadow-lg" />
                      {isPlaying && (
                        <motion.div 
                          className="absolute inset-0 rounded-3xl bg-white/20 animate-ping"
                          initial={{ scale: 0 }}
                          animate={{ scale: 2 }}
                        />
                      )}
                    </motion.div>
                    
                    <h4 className="text-2xl font-bold mb-4 relative z-10 text-center drop-shadow-lg">{mode.title}</h4>
                    <p className="text-white/80 mb-6 relative z-10 text-center leading-relaxed">{mode.description}</p>
                    <div className="text-center mb-8 relative z-10">
                      {/* UPDATED: Glassmorphic badge */}
                      <span className="inline-block px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/20">{mode.preview}</span>
                    </div>
                    
                    {/* Interactive Play Button */}
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); togglePreview(mode.key); }}
                      // UPDATED: Glassmorphic launch button
                      className={`relative z-10 flex items-center justify-center gap-3 p-4 mx-auto bg-black/40 rounded-2xl transition-all duration-300 hover:bg-white/20 backdrop-blur-sm border border-white/20 ${isPlaying ? 'bg-green-500/20 border-green-500/30' : ''}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? <Pause size={24} className="text-green-400" /> : <Play size={24} className="text-white" />}
                      <span className="font-bold">{isPlaying ? 'Live...' : 'Launch'}</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Premium Skills Grid */}
        <section>
          <motion.div 
            className="flex items-center gap-4 mb-12"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Award size={40} className="text-gradient-gold" />
            <h2 className="text-4xl font-bold">Skill Arsenal</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {challengeDefinitions.map((challenge, index) => {
              const isLocked = lockedChallenges[challenge.id];
              const progress = profile?.progress?.[challenge.progressKey] || 0;
              return (
                <motion.div
                  key={challenge.id}
                  // UPDATED: Glassmorphic card base, explicit neon shadow
                  className={`group relative overflow-hidden bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 transition-all duration-700 shadow-2xl h-full ${isLocked ? 'opacity-50' : ''}`}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  whileHover={!isLocked ? { scale: 1.05, y: -10, rotateY: 5, boxShadow: `0 25px 50px -12px ${challenge.color.split(' ')[1] || '#8b5cf6'}30` } : {}}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${challenge.color} opacity-0 group-hover:opacity-20 -z-10 transition-opacity`}></div>
                  <div className="relative z-10 space-y-6">
                    <motion.div 
                      // UPDATED: Glassmorphic icon container
                      className="p-6 bg-black/40 backdrop-blur-sm rounded-3xl mx-auto group-hover:bg-white/20 transition-all"
                      whileHover={!isLocked ? { scale: 1.15 } : {}}
                    >
                      <challenge.icon size={48} className="drop-shadow-lg" />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-3">{challenge.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{challenge.description}</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-3 rounded-full ${challenge.color} relative overflow-hidden`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                      </motion.div>
                    </div>
                    <motion.button
                      onClick={() => !isLocked && handleNavigate(challenge.route, { grade: selectedGrade, level: getLevelName(selectedGrade) })}
                      disabled={isLocked}
                      // UPDATED: Launch button styling
                      className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${isLocked ? 'bg-black/40 text-white/50 cursor-not-allowed border border-white/10' : 'bg-gradient-to-r from-white/10 to-white/20 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'}`}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                    >
                      {isLocked ? <Trophy size={24} /> : <Zap size={24} />}
                      {isLocked ? 'Conquered' : 'Ignite'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Futuristic Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            // UPDATED: Loading screen opacity for deeper look
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <Brain size={96} className="text-purple-400 drop-shadow-2xl" />
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            </motion.div>
            <motion.p 
              className="text-3xl font-bold mt-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Launching Immersion...
            </motion.p>
            <div className="mt-8 w-32 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .text-gradient-gold {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default WhatIfPage;
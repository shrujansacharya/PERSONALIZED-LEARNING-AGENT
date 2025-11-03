// Updated ProgressMap.tsx
import { useState, useEffect } from 'react';
import { MapPin, Trophy, Star, X, Target, Award, RefreshCw, CheckCircle, Circle, Code, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme';

interface Area {
  id: string;
  name: string;
  description: string;
  icon: string;
  career_ids: string[];
  position: { top: string; left: string };
}

interface Quiz {
  id: string;
  area_id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  questions: { id: number; question: string; options: string[]; correct: string }[];
}

const fallbackProfile = {
  user_id: 'test-user-id',
  points: 100,
  username: 'TestStudent',
  completed_activities: ['daily-quiz', 'project-software-1'],
  badges: [
    { id: '1', badge_name: 'Daily Challenger', badge_icon: '/badges/daily-challenger.png' },
    { id: '2', badge_name: 'Project Builder', badge_icon: '/badges/project-builder.png' }
  ],
  daily_challenges_progress: {
    quiz: 75,
    puzzle: 60,
    games: 100,
    reading: 45
  },
  project_builder_progress: {
    'software-1': 25,
    'software-2': 0,
    'science-1': 100,
    'science-2': 15
  }
};

const fallbackCareers = [
  { id: '1', title: 'Sports Analyst' },
  { id: '18', title: 'Aerospace Engineer' },
];

const fallbackChallenges = [
  {
    id: '1',
    title: 'Math Puzzle',
    description: 'Solve 5 math problems in Cricket Kingdom',
    area_id: 'cricket-kingdom',
    reward_points: 50,
  },
];

const fallbackQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    area_id: 'cricket-kingdom',
    difficulty: 'Beginner',
    title: 'Cricket Math Basics',
    questions: [
      { id: 1, question: 'What is 2 + 3?', options: ['4', '5', '6', '7'], correct: '5' },
      { id: 2, question: 'If a team scores 10 runs in 2 overs, how many runs per over?', options: ['4', '5', '6', '7'], correct: '5' },
    ],
  },
  {
    id: 'english-quiz-4-6-1',
    area_id: 'english-empire',
    difficulty: 'Beginner',
    title: 'Basic Grades 4-6 English Quiz',
    questions: [
      { id: 1, question: 'What does "happy" mean?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct: 'Joyful' },
      { id: 2, question: 'What is a synonym for "quick"?', options: ['Slow', 'Fast', 'Big', 'Small'], correct: 'Fast' },
    ],
  },
];

const skillChallenges = [
  { id: 'grammar', name: 'Grammar Practice', icon: '📚' },
  { id: 'reading', name: 'Reading Practice', icon: '📖' },
  { id: 'writing', name: 'Writing Practice', icon: '✍️' },
  { id: 'pronunciation', name: 'Pronunciation Practice', icon: '🗣️' }
];

export const ProgressMap = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const { getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || theme.background;

  useEffect(() => {
    // Replaced Supabase calls with a local data fetch
    fetchData();
    // Removed Supabase-based periodic refresh
    const interval = setInterval(refreshProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  // Updated to use fallback data directly
  const refreshProgress = () => {
    if (refreshing) return;
    setRefreshing(true);
    // Simulate a network request with a delay
    setTimeout(() => {
      setProfile(fallbackProfile);
      setRefreshing(false);
    }, 1000);
  };

  const fetchData = () => {
    // Simulate data fetching with a delay
    setTimeout(() => {
      setProfile(fallbackProfile);
      setLoading(false);
    }, 1500);
  };

  const dailyChallenges = [
    { id: 'quiz', name: 'Daily Quiz', icon: '❓' },
    { id: 'puzzle', name: 'Word Puzzle', icon: '🧩' },
    { id: 'games', name: 'Mini Game', icon: '🎮' },
    { id: 'reading', name: 'Reading Challenge', icon: '📖' }
  ];

  const projectCategories = [
    { id: 'software-1', name: 'Software Development Basics', icon: '💻' },
    { id: 'software-2', name: 'Advanced Programming', icon: '🚀' },
    { id: 'science-1', name: 'Science Experiments', icon: '🔬' },
    { id: 'science-2', name: 'Research Projects', icon: '📊' }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 60) return 'from-blue-500 to-cyan-500';
    if (progress >= 40) return 'from-yellow-500 to-orange-500';
    if (progress >= 20) return 'from-orange-500 to-red-500';
    return 'from-gray-500 to-gray-600';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return 'Completed';
    if (progress >= 80) return 'Advanced';
    if (progress >= 60) return 'Intermediate';
    if (progress >= 40) return 'Beginner';
    return 'Starting';
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${currentBackground})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex flex-col items-center justify-center h-screen text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Trophy className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <p className="text-xl font-semibold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>Mapping your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${currentBackground})` }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 p-6 sm:p-8 max-w-7xl mx-auto text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>Your Learning Adventure Map</h1>
          <button 
            onClick={refreshProgress}
            disabled={refreshing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Progress
          </button>
        </motion.div>

        {/* Daily Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-xl border border-white/20 backdrop-blur-sm bg-black/70 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            <Star className="text-yellow-300 w-6 h-6" />
            Daily Tasks Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyChallenges.map((challenge, idx) => {
              const progress = (profile.daily_challenges_progress || {})[challenge.id] || 0;
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="bg-black/70 p-4 rounded-lg shadow-sm backdrop-blur-sm border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <h4 className="font-semibold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{challenge.name}</h4>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-3 mb-2 text-xs flex rounded bg-white/10">
                      <motion.div 
                        style={{ width: `${progress}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${getProgressColor(progress)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      <span>0%</span>
                      <span>{progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{getProgressStatus(progress)}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Skill Activities Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-xl border border-white/20 backdrop-blur-sm bg-black/70 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            <BookOpen className="text-yellow-300 w-6 h-6" />
            Skill Activities Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillChallenges.map((challenge, idx) => {
              const progress = (profile.progress || {})[challenge.id] || 0;
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="bg-black/70 p-4 rounded-lg shadow-sm backdrop-blur-sm border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <h4 className="font-semibold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{challenge.name}</h4>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-3 mb-2 text-xs flex rounded bg-white/10">
                      <motion.div 
                        style={{ width: `${progress}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${getProgressColor(progress)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      <span>0%</span>
                      <span>{progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{getProgressStatus(progress)}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges Section */}
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            <Award className="text-yellow-300 w-6 h-6" />
            Your Achievements & Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {profile.badges?.map((badge: any) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-black/70 p-3 sm:p-4 rounded-xl shadow-lg border border-white/20 flex flex-col items-center text-center backdrop-blur-sm" 
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
              >
                <img src={badge.badge_icon} alt={badge.badge_name} className="w-12 h-12 rounded-full mb-2" />
                <span className="text-sm font-semibold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{badge.badge_name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressMap;
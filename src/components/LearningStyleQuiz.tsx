import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Star,
  Rocket,
  Sparkles,
  Heart,
  ArrowLeft,
  CheckCircle,
  Headphones,
  Airplay,
  Download,
} from 'lucide-react';
import { themeConfig, useThemeStore } from '../store/theme';
import { useQuizStore } from '../store/quiz';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { auth } from '../lib/firebase';

interface Option {
  text: string;
  type: string;
  emoji: string;
}

interface Question {
  id: number;
  question: string;
  icon: React.ReactElement;
  isInterest?: boolean;
  options: Option[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'You’re learning to code a game. How do you start?',
    icon: <Rocket className="w-14 h-14 text-cyan-300 mb-4" />,
    options: [
      { text: 'Watch a coding tutorial video', type: 'visual', emoji: '🌠' },
      { text: 'Listen to a teacher explain the code', type: 'auditory', emoji: '🎧' },
      { text: 'Try coding and experiment', type: 'kinesthetic', emoji: '🛸' },
    ],
  },
  {
    id: 2,
    question: 'You’re studying for a science test. What’s your plan?',
    icon: <Star className="w-14 h-14 text-yellow-300 mb-4" />,
    options: [
      { text: 'Make colorful diagrams and charts', type: 'visual', emoji: '✨' },
      { text: 'Discuss the topics with friends', type: 'auditory', emoji: '📡' },
      { text: 'Do hands-on experiments', type: 'kinesthetic', emoji: '🚀' },
    ],
  },
  {
    id: 3,
    question: 'You’re exploring a new city. What’s most exciting?',
    icon: <Sparkles className="w-14 h-14 text-pink-300 mb-4" />,
    options: [
      { text: 'Take photos of cool places', type: 'visual', emoji: '🌌' },
      { text: 'Listen to a tour guide’s stories', type: 'auditory', emoji: '🎙️' },
      { text: 'Walk around and touch everything', type: 'kinesthetic', emoji: '👾' },
    ],
  },
  {
    id: 4,
    question: 'You’re learning a new dance. How do you practice?',
    icon: <Heart className="w-14 h-14 text-red-300 mb-4" />,
    options: [
      { text: 'Watch dance videos to copy moves', type: 'visual', emoji: '📸' },
      { text: 'Listen to the music and rhythm', type: 'auditory', emoji: '📖' },
      { text: 'Practice the moves hands-on', type: 'kinesthetic', emoji: '🌟' },
    ],
  },
  {
    id: 5,
    question: 'What’s your favorite topic to explore?',
    icon: <Brain className="w-14 h-14 text-purple-300 mb-4" />,
    isInterest: true,
    options: [
      { text: 'Cricket - Rule the field!', type: 'cricket', emoji: '🏏' },
      { text: 'Space - Explore the stars!', type: 'space', emoji: '🚀' },
      { text: 'Nature - Discover wildlife!', type: 'nature', emoji: '🌿' },
      { text: 'Science - Solve mysteries!', type: 'science', emoji: '🧪' },
      { text: 'Art - Create masterpieces!', type: 'art', emoji: '🎨' },
      { text: 'History - Uncover the past!', type: 'history', emoji: '🏛️' },
    ],
  },
];

interface OptionButtonProps {
  option: Option;
  onClick: (type: string) => void;
  isInterest?: boolean;
}

const OptionButton = memo(({ option, onClick, isInterest }: OptionButtonProps) => {
  const [selected, setSelected] = useState<boolean>(false);

  const handleClick = () => {
    setSelected(true);
    onClick(option.type);
    setTimeout(() => setSelected(false), 600);
  };

  return (
    <motion.div
      className="mb-3"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ willChange: 'transform' }}
    >
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 24px rgba(56, 189, 248, 0.8)',
        }}
        whileTap={{
          scale: 0.97,
          boxShadow: '0 0 30px rgba(129, 140, 248, 0.9)',
        }}
        onClick={handleClick}
        className={`w-full p-4 rounded-2xl text-white font-semibold text-base sm:text-lg transition-all duration-200 relative overflow-hidden border border-cyan-300/40 ${
          isInterest ? 'text-center' : 'text-left'
        }`}
        style={{
          background:
            'radial-gradient(circle at top left, rgba(56,189,248,0.8), transparent 55%), radial-gradient(circle at bottom right, rgba(139,92,246,0.9), rgba(15,23,42,1))',
          willChange: 'transform, box-shadow',
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/10 opacity-70" />
        <div
          className={`flex ${
            isInterest ? 'flex-col items-center' : 'items-center'
          } gap-3 z-10 relative`}
        >
          <motion.span
            className="text-2xl sm:text-3xl"
            animate={selected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {option.emoji}
          </motion.span>
          <span className="leading-tight">{option.text}</span>
        </div>
        {selected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-2xl backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <CheckCircle className="w-9 h-9 text-white drop-shadow-[0_0_12px_rgba(250,250,250,0.9)]" />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
});

const LearningStyleQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const { setTheme, setDynamicBackgrounds, getThemeStyles } = useThemeStore();
  const { setAnswer } = useQuizStore();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveResults = async (style: string, selectedInterest: string, generatedThemeImages: string[]) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}/learning-style`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              learningStyle: style,
              interests: selectedInterest,
              generatedThemeImages,
            }),
          },
        );
        if (!response.ok) throw new Error('Failed to save learning style results.');
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const generateAndSetBackgrounds = async (selectedTheme: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/generate-theme-images`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: selectedTheme }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      // Backend returns: { imageIds: [...] }
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const backgrounds = (data.imageIds || []).map(
        (id: string) => `${baseUrl}/api/images/${id}`,
      );

      // Put these URLs into the theme store
      setDynamicBackgrounds(backgrounds);

      // Also return them so saveResults() can store same URLs in DB
      return backgrounds;
    } else {
      console.error('API Error:', data.error);
      setDynamicBackgrounds([]);
      return [];
    }
  } catch (error) {
    console.error('Network Error:', error);
    setDynamicBackgrounds([]);
    return [];
  }
};



  const handleQuizCompletion = useCallback(
    async (finalAnswers: string[]) => {
      const learningAnswers = finalAnswers.slice(0, questions.length - 1);
      const counts = learningAnswers.reduce(
        (acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const dominantStyle = Object.entries(counts).reduce(
        (a, b) => (counts[a[0]] > counts[b[0]] ? a : b),
        ['visual', 0],
      )[0];

      const selectedInterest = finalAnswers[finalAnswers.length - 1] || 'space';

      setAnswer('learningStyle', dominantStyle);
      setAnswer('interests', selectedInterest);
      setTheme(selectedInterest as keyof typeof themeConfig);

      setIsLoading(true);
      const generatedImages = await generateAndSetBackgrounds(selectedInterest);
      setIsLoading(false);

      saveResults(dominantStyle, selectedInterest, generatedImages).then(() => {
        setShowResult(true);
      });
    },
    [setTheme, setAnswer],
  );

  const handleAnswer = useCallback(
    (type: string) => {
      const newAnswers = [...answers, type];
      setAnswers(newAnswers);

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          handleQuizCompletion(newAnswers);
        }
      }, 600);
    },
    [answers, currentQuestion, handleQuizCompletion],
  );

  const getStyleDescription = (style: string) => {
    const descriptions = {
      visual: {
        title: 'Visual Star',
        description:
          'You learn best with images, videos, and colorful visuals. Your journey will be packed with vibrant content!',
        icon: <Airplay className="w-14 h-14 text-cyan-400" />,
        tips: [
          'Use images, videos, and diagrams to understand concepts.',
          'Create colorful mind maps and charts.',
          'Watch tutorials and animations for better retention.',
        ],
      },
      auditory: {
        title: 'Auditory Ace',
        description:
          'You excel by listening to stories, discussions, and sounds. Get ready for an immersive audio adventure!',
        icon: <Headphones className="w-14 h-14 text-pink-400" />,
        tips: [
          'Listen to podcasts and audio explanations.',
          'Discuss topics with friends or in groups.',
          'Repeat information aloud or use rhymes.',
        ],
      },
      kinesthetic: {
        title: 'Kinesthetic Champion',
        description:
          'You learn best by doing, touching, and moving. Your path will be full of hands-on action!',
        icon: <Rocket className="w-14 h-14 text-yellow-400" />,
        tips: [
          'Engage in hands-on experiments and activities.',
          'Use physical objects or role-playing.',
          'Incorporate movement, like walking while studying.',
        ],
      },
    };
    return style in descriptions
      ? descriptions[style as keyof typeof descriptions]
      : {
          title: 'Unknown Learner',
          description: "We couldn't determine your learning style.",
          icon: <Brain className="w-14 h-14 text-purple-400" />,
          tips: [],
        };
  };

  const downloadBadge = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 400);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 24px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText('Learning Style Badge', 150, 50);
      ctx.font = 'bold 32px Poppins';
      ctx.fillText(
        `${useQuizStore.getState().answers.learningStyle?.toUpperCase() || 'UNKNOWN'}`,
        150,
        100,
      );
      ctx.font = '20px Poppins';
      ctx.fillText(`Interest: ${useQuizStore.getState().answers.interests || 'None'}`, 150, 140);
      ctx.beginPath();
      ctx.arc(150, 220, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Poppins';
      ctx.fillText('🌟', 150, 235);
    }
    const link = document.createElement('a');
    link.download = 'learning-style-badge.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
      setCurrentQuestion(questions.length - 1);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    } else if (currentQuestion === 0) {
      setCurrentQuestion(-1);
      setAnswers([]);
    }
  }, [currentQuestion, answers, showResult, setAnswers]);

  const { answers: quizAnswers } = useQuizStore();
  const learningStyle = quizAnswers.learningStyle;
  const interest = quizAnswers.interests;
  const styleDescription = getStyleDescription(learningStyle || '');

  const themeStore = useThemeStore((state) => state.getThemeStyles());
  useEffect(() => {
    const backgroundsToUse = themeStore.backgrounds;
    if (
      showResult &&
      backgroundsToUse &&
      Array.isArray(backgroundsToUse) &&
      backgroundsToUse.length > 0
    ) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundsToUse.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showResult, themeStore.backgrounds]);

  /* ---------- INTRO SCREEN (FULL-SCREEN) ---------- */

  if (currentQuestion === -1) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 flex items-center justify-center overflow-hidden font-poppins">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-10 h-60 w-60 rounded-full bg-sky-500/40 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-2rem] h-64 w-64 rounded-full bg-indigo-500/40 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-4xl px-6 sm:px-10 py-8 text-center relative"
          style={{ willChange: 'opacity, transform' }}
        >
          <Rocket className="w-16 h-16 text-cyan-300 mb-4 mx-auto drop-shadow-[0_0_18px_rgba(56,189,248,0.8)]" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Welcome to your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
              Learning Style Mission
            </span>{' '}
            🚀
          </h2>
          <p className="text-sm sm:text-base text-slate-200 mb-4 leading-relaxed max-w-2xl mx-auto">
            Answer a few fun questions to find out if you learn best by{' '}
            <span className="font-semibold text-sky-200">seeing</span>,{' '}
            <span className="font-semibold text-emerald-200">listening</span>, or{' '}
            <span className="font-semibold text-amber-200">doing</span>.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5 text-[11px] sm:text-xs">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 py-3">
              <div className="text-2xl mb-1">📺</div>
              <p className="font-medium text-sky-100">Watch</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 py-3">
              <div className="text-2xl mb-1">🎧</div>
              <p className="font-medium text-emerald-100">Listen</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-3 py-3">
              <div className="text-2xl mb-1">🔨</div>
              <p className="font-medium text-amber-100">Do</p>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 mb-4">
            No right or wrong answers — just pick what feels most like you. ✨
          </p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 26px rgba(56,189,248,0.9)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentQuestion(0)}
            className="px-8 sm:px-12 py-3 sm:py-4 bg-white text-slate-900 rounded-full font-bold text-base sm:text-lg shadow-[0_18px_55px_rgba(56,189,248,0.9)] flex items-center gap-3 mx-auto border border-sky-100"
            style={{ willChange: 'transform, box-shadow' }}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500">
              <Rocket className="w-5 h-5 text-white" />
            </span>
            Start Quiz
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ---------- LOADING SCREEN ---------- */

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 flex items-center justify-center overflow-hidden font-poppins">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-20 h-60 w-60 rounded-full bg-sky-500/40 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-2rem] h-64 w-64 rounded-full bg-indigo-500/40 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-3xl bg-white/7 backdrop-blur-2xl rounded-3xl px-6 sm:px-10 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.95)] text-center border border-white/15"
          style={{ willChange: 'opacity, transform' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            style={{ willChange: 'transform' }}
          >
            <Star className="w-20 h-20 text-yellow-300 mx-auto mb-4 drop-shadow-[0_0_18px_rgba(253,224,71,0.8)]" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Setting up your cosmic world...
          </h2>
          <p className="text-sm sm:text-base text-slate-200">
            We’re creating a special theme that matches your learning style. 🌌
          </p>
        </motion.div>
      </div>
    );
  }

  /* ---------- RESULT SCREEN (NO SCROLL, CENTERED, 3D) ---------- */

  if (showResult && learningStyle && interest) {
    const theme = getThemeStyles();
    const backgroundsToUse = theme.backgrounds;
    const currentBackground = backgroundsToUse?.[currentBackgroundIndex];

    const styleEmoji =
      learningStyle === 'visual'
        ? '👀'
        : learningStyle === 'auditory'
        ? '🎧'
        : learningStyle === 'kinesthetic'
        ? '🕺'
        : '🌟';

    const styleGradient =
      learningStyle === 'visual'
        ? 'from-sky-400 via-cyan-300 to-indigo-400'
        : learningStyle === 'auditory'
        ? 'from-pink-400 via-fuchsia-400 to-purple-400'
        : learningStyle === 'kinesthetic'
        ? 'from-amber-400 via-orange-400 to-rose-400'
        : 'from-sky-400 via-cyan-300 to-indigo-400';

    const missions =
      learningStyle === 'visual'
        ? [
            'Draw today’s topic as a comic strip 🎨',
            'Use colors to highlight the most important words 🌈',
          ]
        : learningStyle === 'auditory'
        ? [
            'Explain what you learned to a friend or toy 🧸',
            'Make a silly song to remember a fact 🎵',
          ]
        : learningStyle === 'kinesthetic'
        ? [
            'Act out a story or concept with your body 🤸',
            'Build something small related to your topic 🧱',
          ]
        : [
            'Pick any fun way to show what you learned ✨',
            'Mix watching, listening, and doing in your study time 🎯',
          ];

    return (
      <div className="fixed inset-0 overflow-hidden font-poppins">
        {currentBackground && (
          <motion.div
            key={currentBackgroundIndex}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              backgroundImage: `url(${currentBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'opacity',
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/90 to-sky-950/85 z-0" />

        {/* Floating blobs */}
        <motion.div
          className="pointer-events-none absolute -top-6 left-6 w-20 h-20 rounded-3xl bg-cyan-400/40 blur-xl z-0"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-6 right-10 w-24 h-24 rounded-full bg-indigo-500/40 blur-2xl z-0"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={160}
          colors={['#38bdf8', '#a855f7', '#22c55e', '#facc15']}
        />

        {/* Layout: header top, content center, buttons bottom */}
        <div className="relative w-full h-full z-20 flex flex-col px-3 sm:px-6 py-3 text-slate-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBack}
              className="px-3 py-2 bg-white/10 text-slate-100 rounded-xl font-semibold border border-white/20 text-xs sm:text-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              {styleDescription.icon}
              <span>LearnMyWay Result</span>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-5">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 mb-1 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Your brain just unlocked a new power!</span>
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                You are a {styleDescription.title}!
              </h2>
            </motion.div>

            {/* 3D hero badge */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              whileHover={{ rotateX: 5, rotateY: -5, translateY: -3 }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`relative max-w-4xl w-full rounded-3xl border border-white/20 bg-gradient-to-br ${styleGradient} shadow-[0_20px_60px_rgba(15,23,42,0.9)] px-4 sm:px-7 py-4 sm:py-5 overflow-hidden`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.8),transparent_55%)] opacity-90" />

              <div className="relative flex gap-4 sm:gap-6 items-center">
                <motion.div
                  className="flex flex-col items-center gap-2"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 flex items-center justify-center shadow-[0_18px_45px_rgba(15,23,42,0.75)] border border-white/40">
                    <span className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(15,23,42,0.8)]">
                      {styleEmoji}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/20 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide border border-white/30">
                    <Sparkles className="w-3 h-3" /> Super Skill
                  </span>
                </motion.div>

                <div className="flex-1 text-left">
                  <p className="text-[11px] sm:text-sm text-slate-50 font-semibold mb-1">
                    Hi Explorer! 🌍
                  </p>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    {styleDescription.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-100 mt-2">
                    Your brain says a big <span className="font-bold">“YES!”</span> to this way of
                    learning. We’ll use it to make your study time more fun and powerful. 💪
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Interest + compact info card (tips + missions) */}
            <div className="max-w-5xl w-full flex flex-col gap-3 sm:gap-4">
              {/* Interest */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
                className="max-w-xl mx-auto w-full"
              >
                <div className="p-3 sm:p-4 bg-white/10 rounded-2xl border border-white/20 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-between">
                  <p className="text-xs sm:text-sm text-slate-100">
                    🎯 Favorite world:{' '}
                    <span className="font-extrabold text-cyan-300">
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </span>
                  </p>
                  <span className="text-[10px] sm:text-xs text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    We’ll build activities around this!
                  </span>
                </div>
              </motion.div>

              {/* Compact tips + missions */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
                className="max-w-5xl mx-auto w-full bg-white/8 rounded-2xl border border-white/15 backdrop-blur-md px-3 sm:px-5 py-3 sm:py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-left">
                  {/* Superpowers */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-50 mb-2 flex items-center gap-2">
                      🌟 Your superpowers
                    </h3>
                    <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-100">
                      {styleDescription.tips.slice(0, 3).map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 bg-white/8 rounded-xl px-2.5 py-2 border border-white/10"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missions */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-50 mb-2 flex items-center gap-2">
                      🎮 Today’s missions
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-200 mb-1.5">
                      Try 1 or both and level up your brain power!
                    </p>
                    <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-100">
                      {missions.map((m, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 bg-black/15 rounded-xl px-2.5 py-2 border border-white/10"
                        >
                          <span className="mt-0.5 text-base">{idx === 0 ? '⭐' : '✨'}</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Buttons & footer (bottom) */}
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.06, translateY: -2 }}
                whileTap={{ scale: 0.97, translateY: 0 }}
                onClick={downloadBadge}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-[0_14px_40px_rgba(16,185,129,0.7)] flex items-center gap-2 border border-emerald-200/70 text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" /> Download Badge
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.06, translateY: -2 }}
                whileTap={{ scale: 0.97, translateY: 0 }}
                onClick={() => navigate('/explore-menu')}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-sky-500 text-white rounded-xl font-bold shadow-[0_14px_40px_rgba(56,189,248,0.7)] flex items-center gap-2 border border-sky-200/70 text-xs sm:text-sm"
              >
                <Rocket className="w-4 h-4" /> Start Learning Adventure
              </motion.button>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-300">
              🎉 Great job, space explorer! You’ve unlocked your learning style — now let’s use it to
              make every study session an adventure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- QUESTION SCREEN (UNCHANGED) ---------- */

  const question = questions[currentQuestion];
  const isInterestQuestion = question.isInterest;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 flex items-center justify-center overflow-hidden font-poppins">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-10 h-60 w-60 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[-2rem] h-64 w-64 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-2xl px-4 py-6 relative z-10 space-y-6 text-center"
        >
          {/* Progress */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-200 mb-1.5">
              <span>Progress</span>
              <span className="font-medium">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Back */}
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBack}
              className="p-2.5 bg-white/10 border border-white/20 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-slate-100" />
            </motion.button>

            <p className="text-[10px] sm:text-xs text-slate-300">
              Question {currentQuestion + 1} · Follow your first instinct
            </p>
          </div>

          {/* Question */}
          <div className="text-center space-y-3">
            {question.icon}

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl sm:text-2xl font-bold text-slate-50"
            >
              {question.question}
            </motion.h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Choose what feels most like you — there’s no wrong answer.
            </p>
          </div>

          {/* Options */}
          <div
            className={
              isInterestQuestion
                ? 'grid gap-3 grid-cols-1 sm:grid-cols-2'
                : 'grid gap-3 grid-cols-1'
            }
          >
            {question.options.map((option, index) => (
              <motion.div
                key={option.text}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
              >
                <OptionButton
                  option={option}
                  onClick={handleAnswer}
                  isInterest={question.isInterest}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-200">
            Every tap helps us build your personal learning galaxy. 🌌
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LearningStyleQuiz;

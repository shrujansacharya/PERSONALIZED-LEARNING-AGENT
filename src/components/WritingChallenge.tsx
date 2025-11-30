import React, { useState, useEffect } from 'react';
import { PenTool, ArrowLeft, Star, Trophy, Rotate3D, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const WritingChallenge = () => {
  const navigate = useNavigate();
  const themeStore = useThemeStore();
  const theme = themeStore.getThemeStyles();
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || (theme.backgrounds && theme.backgrounds.length > 0 ? theme.backgrounds[0] : '');

  useEffect(() => {
    saveProgress();
  }, [writingInput]);

  const saveProgress = () => {
    localStorage.setItem('writingChallengeProgress', writingInput);
  };

  const loadProgress = () => {
    const savedProgress = localStorage.getItem('writingChallengeProgress');
    if (savedProgress) {
      setWritingInput(savedProgress);
    }
  };

  const clearProgress = () => {
    localStorage.removeItem('writingChallengeProgress');
  };

  // Fallback profile data
  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    points: 0,
    time_spent: {},
    completed_activities: [],
    progress: { vocabulary: 0, grammar: 0, conversation: 0, pronunciation: 0, reading: 0, writing: 0 },
    badges: []
  };

  useEffect(() => {
    fetchProfile();
    checkAttempts();
    generateWritingPrompt();
    loadProgress();
  }, [selectedGrade]);
  
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      // UPDATED: Slower transition for cosmic feel (10 seconds)
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  useEffect(() => {
    saveProgress();
  }, [writingInput]);

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

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `writing-attempts-${today}`;
    const stored = localStorage.getItem(attemptKey);
    const completionKey = `writing-completed-${today}`;
    const storedCompletion = localStorage.getItem(completionKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
    } else {
      // Reset attempts for new day
      localStorage.removeItem('writing-attempts-' + new Date(Date.now() - 86400000).toDateString());
      setAttempts(0);
    }

    if (storedCompletion || (stored && JSON.parse(stored).attempts >= 2)) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `writing-attempts-${today}`;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const attemptData = {
      attempts: newAttempts,
      date: today
    };
    localStorage.setItem(attemptKey, JSON.stringify(attemptData));

    if (newAttempts >= 2) {
      setIsLocked(true);
    }
  };

  const saveCompletion = () => {
    const today = new Date().toDateString();
    const completionKey = `writing-completed-${today}`;
    localStorage.setItem(completionKey, 'true');
    setIsLocked(true);
  };

  const resetChallenge = () => {
    setWritingInput('');
    setWritingFeedback('');
    setSubmitted(false);
    setShowCompletion(false);
    setCanReattempt(false);
    setShowCelebration(false);
    setNotification(null);
    generateWritingPrompt();
    clearProgress();
  };

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000); // Auto-hide after 4 seconds
  };

  const handleReattempt = () => {
    if (attempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

  const generateWritingPrompt = async () => {
    setLoading(true);
    const today = new Date().toDateString();
    const promptKey = `writing-prompt-${selectedGrade}-${today}`;
    const storedPrompt = localStorage.getItem(promptKey);

    if (storedPrompt) {
      setWritingPrompt(storedPrompt);
      setLoading(false);
      return;
    }

    try {
      const prompt = `Generate a creative writing prompt for grades ${selectedGrade}. For grades 4-6, keep it simple with basic vocabulary and short responses. For grades 7-9, include more complex ideas and vocabulary. For grades 10-12, use advanced themes and require detailed responses. Make it engaging and appropriate for the grade level. The prompt should encourage descriptive writing, storytelling, or opinion expression. Format as JSON: { "prompt": "string", "type": "creative|opinion|descriptive", "wordCount": number }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setWritingPrompt(data.prompt);
      localStorage.setItem(promptKey, data.prompt);
    } catch (error) {
      console.error('Error generating writing prompt:', error);
      // Fallback prompt
      const fallbackPrompt = "Write a short story about a magical adventure in your favorite place. Describe what you see, hear, and feel during your adventure. Use at least 5 descriptive words.";
      setWritingPrompt(fallbackPrompt);
      localStorage.setItem(promptKey, fallbackPrompt);
    } finally {
      setLoading(false);
    }
  };

  const handleWritingSubmit = async () => {
    if (!writingInput.trim()) {
      showNotification('Please write something before submitting!', 'error');
      return;
    }

    setSubmitted(true);
    saveAttempt(); // Track the attempt
    showNotification('Evaluating your writing...', 'info');

    // AI evaluation of writing
    try {
      const prompt = `Evaluate writing for grades ${selectedGrade}. Prompt: "${writingPrompt}". Student response: "${writingInput}". Analyze grammar, vocabulary, creativity, structure, and coherence. Provide a score from 0-10 and detailed feedback. Format as JSON: { "score": number, "feedback": "string", "strengths": "string", "improvements": "string", "grammarScore": number, "vocabularyScore": number, "creativityScore": number }`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const evaluation = JSON.parse(text);

      const pointsEarned = evaluation.score * 2; // Convert to 0-20 points
      const newProgress = Math.min(progress + pointsEarned, 100);
      setProgress(newProgress);

      // Enhanced confetti animations based on score
      if (evaluation.score >= 9) {
        // Excellent performance
        confetti({
          particleCount: 300,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#00FFFF', '#008080', '#32CD32', '#40E0D0'],
          shapes: ['circle', 'square'],
          scalar: 1.5,
          gravity: 0.3
        });
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#00FF00', '#00FFFF'],
            shapes: ['star'],
            scalar: 2
          });
        }, 500);
        showNotification(`Excellent work! Score: ${evaluation.score}/10`, 'success');
      } else if (evaluation.score >= 7) {
        // Good performance
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#00FFFF', '#008080'],
          shapes: ['circle', 'square'],
          scalar: 1.2
        });
        showNotification(`Great job! Score: ${evaluation.score}/10`, 'success');
      } else if (evaluation.score >= 5) {
        // Satisfactory performance
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#00FFFF']
        });
        showNotification(`Good effort! Score: ${evaluation.score}/10`, 'success');
      } else {
        showNotification('Your writing needs improvement. Please try again.', 'error');
      }

      // Update profile
      if (profile.user_id !== 'test-user-id') {
        const newProfileProgress = { ...profile.progress, writing: newProgress };

      }

      setWritingFeedback(`📝 **Writing Evaluation Results:**\n\nOverall Score: ${evaluation.score}/10\n\n💬 ${evaluation.feedback}\n\n✅ **Strengths:** ${evaluation.strengths}\n\n💡 **Improvements:** ${evaluation.improvements}\n\n📊 **Detailed Scores:**\n- Grammar: ${evaluation.grammarScore}/10\n- Vocabulary: ${evaluation.vocabularyScore}/10\n- Creativity: ${evaluation.creativityScore}/10`);

      // Mark as completed
      saveCompletion();

      // Show feedback in completion screen only if score >= 5
      if (evaluation.score >= 5) {
        setShowCompletion(true);
        setShowCelebration(true);
      } else {
        setSubmitted(false);
        setShowCompletion(false);
        setShowCelebration(false);
      }
    } catch (error) {
      // Fallback evaluation
      const wordCount = writingInput.trim().split(/\s+/).filter(word => word.length > 0).length;
      const score = Math.min(wordCount / 10, 10); // Simple scoring based on word count
      const newProgress = Math.min(progress + (score / 2), 100);
      setProgress(newProgress);
      setWritingFeedback(`Word count: ${wordCount}\n\nGreat effort! Your writing shows creativity and thoughtfulness. Keep practicing to improve your writing skills.`);

      // Mark as completed
      saveCompletion();

      // Basic confetti for fallback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#00FFFF']
      });

      showNotification('Evaluation complete! Check your feedback.', 'success');

      // Show feedback in completion screen
      setShowCompletion(true);
      setShowCelebration(true);
    }
  };

  const awardBadgeAndPoints = async () => {
    if (profile && profile.user_id) {
      const userDocRef = doc(db, 'users', profile.user_id);
      const newPoints = (profile.points || 0) + 50;
      const newBadges = [...(profile.badges || []), {
        id: `writing-mastery-${Date.now()}`,
        name: 'Creative Writer',
        description: 'Mastered a writing challenge.',
        timestamp: new Date().toISOString(),
      }];

      await updateDoc(userDocRef, {
        points: newPoints,
        badges: newBadges,
      });
    }
  };


  const submitWriting = async () => {
    if (profile && profile.user_id) {
      const userDocRef = doc(db, 'users', profile.user_id);
      const newProgress = {
        ...profile.progress,
        writing: progress,
      };

      await updateDoc(userDocRef, {
        progress: newProgress,
      });
    }
  };


  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"></div>

        <div className="absolute inset-0 z-5">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-teal-300"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
              animate={{
                y: [0, (Math.random() > 0.5 ? 1 : -1) * Math.random() * 200],
                x: [0, (Math.random() > 0.5 ? 1 : -1) * Math.random() * 200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
        
        <motion.div
          className="bg-black/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 text-center relative z-10 max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div className="relative mb-6 w-16 h-16 mx-auto">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <PenTool className="text-teal-400 w-16 h-16" />
            </motion.div>
            <motion.div
              className="absolute top-0 left-0 w-full h-0.5 bg-blue-300/80"
              style={{ boxShadow: '0 0 8px #67e8f9' }}
              animate={{ y: [0, 64], opacity: [0.8, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "circIn" }}
            />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3 font-mono tracking-wide">
             Crafting Your Prompt...
          </h2>

          <p className="text-white/70 text-lg mb-6">
            Preparing your challenge...
          </p>

          <div className="w-full bg-white/10 rounded-full h-2.5 mb-6 overflow-hidden">
             <motion.div
               className="bg-gradient-to-r from-blue-500 to-teal-400 h-full"
               initial={{ width: '0%' }}
               animate={{ width: '100%' }}
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
             />
          </div>

          <motion.div
            className="text-teal-300 text-sm font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            🚀 Just a moment...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div
        className="min-h-screen p-8 relative overflow-hidden flex flex-col items-center justify-center"
        style={{
          backgroundImage: theme.backgrounds?.[currentBackgroundIndex] ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        {/* UPDATED: Deep Cosmic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>
        <motion.div
          // UPDATED: Glassmorphic locked screen
          className="bg-black/75 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-red-500/30 border border-red-500/50 text-center max-w-lg relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4 text-red-400">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Activity Locked</h2>
          <p className="text-white mb-6">
            You have reached the maximum of 2 attempts for today. Please come back tomorrow to try again.
          </p>
          <motion.button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/40 hover:from-blue-600 hover:to-teal-600 transition"
            whileHover={{ scale: 1.05 }}
          >
            Previous Page
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div
        className="min-h-screen p-8 relative overflow-hidden flex flex-col items-center justify-center"
        style={{
          backgroundImage: theme.backgrounds?.[currentBackgroundIndex] ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        {/* UPDATED: Deep Cosmic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>
        <motion.div 
          // UPDATED: Glassmorphic completion screen
          className="bg-black/75 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-teal-500/30 border border-teal-500/50 max-w-4xl w-full text-white relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-4xl font-extrabold mb-6 flex items-center gap-4 text-cyan-400">
            <Trophy className="text-yellow-400 drop-shadow-lg" size={48} />
            Congratulations! Writing Activity Completed!
          </h2>
          <div className="whitespace-pre-line bg-black/60 p-6 rounded-xl border border-white/10 mb-6">{writingFeedback}</div>
          <div className="flex justify-center gap-6">
            {attempts < 2 && (
              <motion.button
                onClick={handleReattempt}
                className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/40 hover:from-blue-600 hover:to-teal-600 transition"
                whileHover={{ scale: 1.05 }}
              >
                Reattempt Acivity
              </motion.button>
            )}
            <motion.button
              onClick={() => navigate(-1)}
              className="bg-white/90 text-teal-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition"
              whileHover={{ scale: 1.05 }}
            >
              Previous Page
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        backgroundImage: theme.backgrounds?.[currentBackgroundIndex] ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* UPDATED: Deep Cosmic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          // UPDATED: Glassmorphic header panel
          className="bg-black/75 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-cyan-500/30 border border-cyan-500/50"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              // UPDATED: Glassmorphic button
              className="flex items-center gap-2 bg-black/40 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition border border-white/20"
            >
              <ArrowLeft size={20} />
              Previous Page
            </button>
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Grade Level:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                // UPDATED: Glassmorphic select
                className="px-4 py-2 rounded-xl bg-black/40 text-white border border-white/20 focus:ring-teal-400 focus:border-teal-400"
              >
                <option value="4-6">4-6 (Beginner)</option>
                <option value="7-9">7-9 (Intermediate)</option>
                <option value="10-12">10-12 (Advanced)</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center gap-4">
            <PenTool className="text-teal-400 drop-shadow-lg" size={48} />
            Writing Practice
          </h1>
          <p className="text-lg text-white/80 mb-6">Express yourself through creative writing!</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Status</span>
              <span>{submitted ? 'Completed' : 'In Progress'}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-full rounded-full shadow-lg shadow-teal-500/50"
                initial={{ width: 0 }}
                animate={{ width: submitted ? '100%' : '50%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Writing Content */}
        <AnimatePresence mode="wait">
          <motion.div
            // UPDATED: Glassmorphic card container
            className="bg-black/75 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/30 border border-blue-500/50"
            initial={{ opacity: 0, rotateX: -10 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-8">
              {/* Writing Prompt */}
              <motion.div
                // UPDATED: Glassmorphic inner card
                className="bg-black/40 p-6 rounded-2xl border border-white/10 shadow-lg"
                whileHover={{ scale: 1.01 }}
              >
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Writing Prompt</h2>
                <p className="text-white/90 text-lg leading-relaxed">{writingPrompt}</p>
              </motion.div>

              {/* Writing Input */}
              <motion.div
                // UPDATED: Glassmorphic inner card
                className="bg-black/40 p-6 rounded-2xl border border-white/10 shadow-lg"
                whileHover={{ scale: 1.01 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Your Response</h2>
                <textarea
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  placeholder="Start writing your response here..."
                  // UPDATED: Neon input style
                  className="w-full h-64 p-4 rounded-xl bg-black/75 text-white border border-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                  disabled={submitted}
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-white/70">
                    Word count: {writingInput.trim().split(/\s+/).filter(word => word.length > 0).length}
                  </p>
                  {!submitted && (
                    <motion.button
                      onClick={handleWritingSubmit}
                      className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/40 hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Feedback
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Feedback */}
              {submitted && writingFeedback && (
                <motion.div
                  className="bg-black/70 p-6 rounded-2xl border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-white whitespace-pre-line">{writingFeedback}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                notification.type === 'success'
                  ? 'bg-green-500/90 border-green-400 text-white'
                  : notification.type === 'error'
                  ? 'bg-red-500/90 border-red-400 text-white'
                  : 'bg-blue-500/90 border-blue-400 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === 'success' && <Sparkles className="text-yellow-300" size={20} />}
                {notification.type === 'error' && <Star className="text-red-300" size={20} />}
                {notification.type === 'info' && <Rotate3D className="text-blue-300" size={20} />}
                <p className="font-medium">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WritingChallenge;
import React, { useState, useEffect } from 'react';
import { Mic, ArrowLeft, Star, Trophy, Rotate3D } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
// No longer assuming supabase is a correctly configured library

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const PronunciationChallenge = () => {
  const navigate = useNavigate();
  const themeStore = useThemeStore();
  const theme = themeStore.getThemeStyles();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [pronunciationWords, setPronunciationWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [dailyAttempts, setDailyAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || (theme.backgrounds && theme.backgrounds.length > 0 ? theme.backgrounds[0] : '');
  
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
    saveState();
  }, [currentWordIndex, pronunciationWords, progress]);

  const saveState = () => {
    if (profile && pronunciationWords.length > 0) {
      const stateKey = `pronunciation-challenge-state-${profile.user_id}`;
      const state = {
        currentWordIndex,
        pronunciationWords,
        progress,
        selectedGrade,
        timestamp: Date.now()
      };
      localStorage.setItem(stateKey, JSON.stringify(state));
    }
  };

  const loadSavedState = () => {
    if (profile) {
      const stateKey = `pronunciation-challenge-state-${profile.user_id}`;
      const savedState = localStorage.getItem(stateKey);

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          // Check if state is from today (within 24 hours)
          const isRecent = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;

          if (isRecent && state.pronunciationWords && state.pronunciationWords.length > 0) {
            setCurrentWordIndex(state.currentWordIndex || 0);
            setPronunciationWords(state.pronunciationWords);
            setProgress(state.progress || 0);
            setSelectedGrade(state.selectedGrade || '4-6');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading saved state:', error);
        }
      }
    }
    // If no saved state or invalid, generate new challenge
    generatePronunciationChallenge();
  };

  const clearSavedState = () => {
    if (profile) {
      const stateKey = `pronunciation-challenge-state-${profile.user_id}`;
      localStorage.removeItem(stateKey);
    }
  };

  useEffect(() => {
    fetchProfile();
    checkAttempts();
  }, []);

  // Load saved state after profile is fetched
  useEffect(() => {
    if (profile) {
      loadSavedState();
    }
  }, [profile]);
  
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  // Save state whenever currentWordIndex or progress changes
  useEffect(() => {
    if (!loading && pronunciationWords.length > 0 && profile) {
      saveState();
    }
  }, [currentWordIndex, progress, pronunciationWords, profile]);

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `pronunciation-attempts-${today}`;
    const completionKey = `pronunciation-completed-${today}`;
    const stored = localStorage.getItem(attemptKey);
    const storedCompletion = localStorage.getItem(completionKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setDailyAttempts(attemptData.attempts || 0);
      setIsLocked(attemptData.attempts >= 2 || storedCompletion === 'true');
    } else {
      // Reset attempts for new day
      localStorage.removeItem('pronunciation-attempts-' + new Date(Date.now() - 86400000).toDateString());
      localStorage.removeItem('pronunciation-completed-' + new Date(Date.now() - 86400000).toDateString());
      setDailyAttempts(0);
      setIsLocked(storedCompletion === 'true');
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `pronunciation-attempts-${today}`;
    const newAttempts = dailyAttempts + 1;
    setDailyAttempts(newAttempts);

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
    const completionKey = `pronunciation-completed-${today}`;
    localStorage.setItem(completionKey, 'true');
    setIsLocked(true);
    clearSavedState(); // Clear saved state when challenge is completed
  };

  const resetChallenge = () => {
    setCurrentWordIndex(0);
    setShowCompletion(false);
    setCanReattempt(false);
    setFeedback('');
    setAttempts(0);
    setSubmitted(false);
    clearSavedState(); // Clear saved state when resetting
    generatePronunciationChallenge();
  };

  const handleReattempt = () => {
    if (dailyAttempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

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



  const generatePronunciationChallenge = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 8 simple and unique words for pronunciation practice for grades ${selectedGrade}. Each item should include: id, grade, word, phonetic (IPA notation), difficulty level. Ensure the words are easy and appropriate for the grade level. Format as JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setPronunciationWords(data || []);
    } catch (error) {
      console.error('Error generating pronunciation words:', error);
      // Fallback data
      const fallbackData = [
        { id: 1, grade: selectedGrade, word: 'apple', phonetic: '/ˈæpəl/', difficulty: 'Easy' },
        { id: 2, grade: selectedGrade, word: 'banana', phonetic: '/bəˈnænə/', difficulty: 'Easy' },
        { id: 3, grade: selectedGrade, word: 'cat', phonetic: '/kæt/', difficulty: 'Easy' },
        { id: 4, grade: selectedGrade, word: 'dog', phonetic: '/dɔːɡ/', difficulty: 'Easy' },
        { id: 5, grade: selectedGrade, word: 'house', phonetic: '/haʊs/', difficulty: 'Easy' },
        { id: 6, grade: selectedGrade, word: 'school', phonetic: '/skuːl/', difficulty: 'Easy' },
        { id: 7, grade: selectedGrade, word: 'water', phonetic: '/ˈwɔːtər/', difficulty: 'Easy' },
        { id: 8, grade: selectedGrade, word: 'friend', phonetic: '/frend/', difficulty: 'Easy' }
      ];
      setPronunciationWords(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handlePronunciationCheck = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && currentWord) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        let errorMessage = 'Speech recognition error. ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech was detected. Please try speaking louder or closer to the microphone.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone was found. Ensure that a microphone is installed and that microphone settings are configured correctly.';
            break;
          case 'not-allowed':
            errorMessage += 'Permission to use microphone is blocked. To change, go to chrome://settings/content/microphone and allow microphone access.';
            break;
          case 'network':
            errorMessage += 'A network error occurred. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech recognition service is not allowed.';
            break;
          default:
            errorMessage += 'An unknown error occurred: ' + event.error;
        }
        setFeedback(errorMessage);
        setAttempts(prev => prev + 1);
      };

      recognition.onresult = async (e: any) => {
        console.log('Speech recognition result:', e);
        if (e.results && e.results[0] && e.results[0][0]) {
          const transcript = e.results[0][0].transcript.toLowerCase().trim();
          const expected = currentWord.word.toLowerCase().trim();
          console.log('Transcript:', transcript, 'Expected:', expected);
          
          setFeedback('Evaluating your pronunciation...');

          // AI evaluation of pronunciation
          try {
            const prompt = `Evaluate pronunciation for grades ${selectedGrade}. Expected word/phrase: "${expected}". Student said: "${transcript}". Phonetic guide: "${currentWord.phonetic}". Analyze pronunciation accuracy, phonetic similarity, and provide detailed feedback. Score from 0-10. Format as JSON: { "score": number, "accuracy": "string", "feedback": "string", "phoneticTips": "string" }`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json|```/g, '').trim();
            const evaluation = JSON.parse(text);

            const pointsEarned = evaluation.score * 2; // Convert to 0-20 points
            const newProgress = Math.min(progress + pointsEarned, 100);
            setProgress(newProgress);

            if (evaluation.score >= 7) {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FF69B4']
              });
            }

            // Update profile
            if (profile.user_id !== 'test-user-id') {
              const newProfileProgress = { ...profile.progress, pronunciation: newProgress };

            }

            setFeedback(`🎤 ${evaluation.accuracy}\n💬 ${evaluation.feedback}\n💡 ${evaluation.phoneticTips}`);

            // Move to next word after a delay
            setTimeout(() => {
              if (currentWordIndex < pronunciationWords.length - 1) {
                setCurrentWordIndex(prev => prev + 1);
                setFeedback('');
                setAttempts(0);
              } else {
                // Challenge completed
                confetti({
                  particleCount: 200,
                  spread: 120,
                  origin: { y: 0.6 },
                  colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
                  shapes: ['circle', 'square'],
                  scalar: 1.2
                });
                setShowCompletion(true);
                saveAttempt();
                saveCompletion();
              }
            }, 3000);
          } catch (error) {
            console.error('AI evaluation error:', error);
            // Fallback evaluation
            if (transcript === expected) {
              setFeedback('Excellent pronunciation!');
              const newProgress = Math.min(progress + 10, 100);
              setProgress(newProgress);
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            } else {
              setFeedback(`Try again! You said: "${transcript}". Expected: "${expected}"`);
              setAttempts(prev => prev + 1);
            }
          }
        } else {
          console.warn('No speech results received');
          setFeedback('No speech detected. Please try again.');
          setAttempts(prev => prev + 1);
        }
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setFeedback('Error starting speech recognition. Please try again.');
        setAttempts(prev => prev + 1);
      }
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const skipWord = () => {
    if (currentWordIndex < pronunciationWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setFeedback('');
      setAttempts(0);
    } else {
      // Challenge completed
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
        shapes: ['circle', 'square'],
        scalar: 1.2
      });
      setShowCompletion(true);
      saveAttempt();
      saveCompletion();
    }
  };

  const awardBadgeAndPoints = async () => {
    if (profile && profile.user_id) {
      const userDocRef = doc(db, 'users', profile.user_id);
      const newPoints = (profile.points || 0) + 50;
      const newBadges = [...(profile.badges || []), {
        id: `pronunciation-mastery-${Date.now()}`,
        name: 'Pronunciation Pro',
        description: 'Mastered a pronunciation challenge.',
        timestamp: new Date().toISOString(),
      }];

      await updateDoc(userDocRef, {
        points: newPoints,
        badges: newBadges,
      });
    }
  };

  const submitPronunciation = async () => {
    if (profile && profile.user_id) {
      const userDocRef = doc(db, 'users', profile.user_id);
      const newProgress = {
        ...profile.progress,
        pronunciation: progress,
      };

      await updateDoc(userDocRef, {
        progress: newProgress,
      });
    }
  };

  const currentWord = pronunciationWords[currentWordIndex];

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
              className="absolute rounded-full bg-red-300"
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
              <Mic className="text-red-400 w-16 h-16" />
            </motion.div>
            <motion.div
              className="absolute top-0 left-0 w-full h-0.5 bg-pink-300/80"
              style={{ boxShadow: '0 0 8px #ec4899' }}
              animate={{ y: [0, 64], opacity: [0.8, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "circIn" }}
            />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3 font-mono tracking-wide">
             Tuning The Mic...
          </h2>

          <p className="text-white/70 text-lg mb-6">
            Preparing your challenge...
          </p>

          <div className="w-full bg-white/10 rounded-full h-2.5 mb-6 overflow-hidden">
             <motion.div
               className="bg-gradient-to-r from-red-500 to-pink-400 h-full"
               initial={{ width: '0%' }}
               animate={{ width: '100%' }}
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
             />
          </div>

          <motion.div
            className="text-red-300 text-sm font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            🚀 Just a moment...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Locked Screen
  if (isLocked) {
    return (
      <div 
        className="min-h-screen p-8 relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: theme.backgrounds?.[currentBackgroundIndex] ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <motion.div
          className="bg-black/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Trophy className="text-yellow-400 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-4">Daily Limit Reached</h2>
          <p className="text-white/80 mb-6">
            You've completed the Pronunciation Challenge twice today! Come back tomorrow for more practice.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all"
          >
            Previous Page
          </button>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  if (showCompletion) {
    return (
      <div 
        className="min-h-screen p-8 relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: theme.backgrounds?.[currentBackgroundIndex] ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <motion.div
          className="bg-black/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Trophy className="text-yellow-400 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-4">Challenge Completed!</h2>
          <p className="text-white/80 mb-6">
            Great job on completing the Pronunciation Challenge! Your pronunciation skills are improving.
          </p>
          <div className="space-y-3">
            {dailyAttempts < 2 && (
              <button
                onClick={handleReattempt}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all"
              >
                Try Again ({2 - dailyAttempts} attempts left)
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-black/80 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              Previous Page
            </button>
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
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          className="bg-black/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
            >
              <ArrowLeft size={20} />
              Previous Page
            </button>
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Grade Level:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 rounded-xl bg-black/80 text-white border border-white/20"
              >
                <option value="4-6">4-6 (Beginner)</option>
                <option value="7-9">7-9 (Intermediate)</option>
                <option value="10-12">10-12 (Advanced)</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center gap-4">
            <Mic className="text-red-400" size={48} />
            Pronunciation Challenge
          </h1>
          <p className="text-lg text-white/80 mb-6">Practice pronunciation with AI feedback!</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Progress</span>
              <span>{currentWordIndex + 1} / {pronunciationWords.length}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentWordIndex + 1) / pronunciationWords.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Pronunciation Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            className="bg-black/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            style={{ perspective: '1000px' }}
            initial={{ opacity: 0, rotateX: -20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 20 }}
            transition={{ duration: 0.8 }}
          >
            {currentWord && (
              <div className="text-center space-y-8">
                <motion.div
                  className="bg-black/80 p-8 rounded-2xl transform-gpu"
                  whileHover={{ rotateY: 5, rotateX: 3 }}
                >
                  <h2 className="text-4xl font-bold text-white mb-4">{currentWord.word}</h2>
                  <p className="text-white/70 text-xl mb-2">Phonetic: {currentWord.phonetic}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentWord.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                      currentWord.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {currentWord.difficulty}
                    </span>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <motion.button
                    onClick={handlePronunciationCheck}
                    disabled={isListening}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-3 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic size={24} />
                    {isListening ? 'Listening...' : 'Speak Now'}
                  </motion.button>

                  {attempts > 0 && (
                    <p className="text-yellow-300 text-sm">Attempts: {attempts}</p>
                  )}

                  <motion.button
                    onClick={skipWord}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Skip Word
                  </motion.button>
                </div>

                {feedback && (
                  <motion.div
                    className="bg-black/80 p-6 rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-white whitespace-pre-line">{feedback}</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PronunciationChallenge;
import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDLXMuqZCaMYhf4pWbIoo9_YlRF7zOfHKo');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const SentenceBuilderChallenge = () => {
  const navigate = useNavigate();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sentenceData, setSentenceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);

  // Fallback profile data
  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    points: 0,
    time_spent: {},
    completed_activities: [],
    progress: { sentence: 0, vocabulary: 0, grammar: 0, conversation: 0, pronunciation: 0, reading: 0, writing: 0 },
    badges: []
  };

  useEffect(() => {
    fetchProfile();
    checkAttempts();
    generateSentenceChallenge();
  }, [selectedGrade]);

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `sentence-attempts-${today}`;
    const stored = localStorage.getItem(attemptKey);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
      setIsLocked(attemptData.attempts >= 2);
    } else {
      localStorage.removeItem('sentence-attempts-' + new Date(Date.now() - 86400000).toDateString());
      setAttempts(0);
      setIsLocked(false);
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `sentence-attempts-${today}`;
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

  const resetChallenge = () => {
    setCurrentSentenceIndex(0);
    setShowAnswer(false);
    setShowCompletion(false);
    setCanReattempt(false);
    generateSentenceChallenge();
  };

  const handleReattempt = () => {
    if (attempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

  const handleCompleteChallenge = () => {
    setShowCompletion(true);
    saveAttempt();
    confetti({
      particleCount: 300,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
      shapes: ['circle', 'square'],
      scalar: 1.5,
      gravity: 0.3
    });
  };

  const fetchProfile = async () => {
    try {
      // Assuming a mock Supabase setup or Firebase equivalent as used in other files
      // NOTE: Original file had supabase calls commented out or non-functional.
      // We will skip real profile fetch to avoid breaking the demo and use fallback.
      setProfile(fallbackProfile);
      setProgress(fallbackProfile.progress.sentence);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(fallbackProfile);
      setProgress(fallbackProfile.progress.sentence);
    }
  };

  const generateSentenceChallenge = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 10 unique sentence-building exercises for grades ${selectedGrade}. Each exercise should include: id, grade, words (a list of words to arrange), correctSentence (the correct sentence), explanation (grammar or context explanation). Format as JSON array.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setSentenceData(data || []);
    } catch (error) {
      console.error('Error generating sentences:', error);
      const fallbackData = [
        { id: 1, grade: selectedGrade, words: ['The', 'dog', 'quickly', 'runs'], correctSentence: 'The dog runs quickly.', explanation: 'The sentence follows subject-verb-adverb order.' },
        { id: 2, grade: selectedGrade, words: ['She', 'a', 'book', 'reads'], correctSentence: 'She reads a book.', explanation: 'The indefinite article "a" comes before the noun.' },
        { id: 3, grade: selectedGrade, words: ['went', 'We', 'to', 'the', 'park'], correctSentence: 'We went to the park.', explanation: 'The simple past tense verb "went" is used.' },
        { id: 4, grade: selectedGrade, words: ['is', 'He', 'tall', 'very'], correctSentence: 'He is very tall.', explanation: 'The adjective "tall" is modified by the adverb "very".' },
        { id: 5, grade: selectedGrade, words: ['later', 'I', 'will', 'call', 'you'], correctSentence: 'I will call you later.', explanation: 'The modal verb "will" is used for future actions.' },
        { id: 6, grade: selectedGrade, words: ['They', 'were', 'eating', 'pizza'], correctSentence: 'They were eating pizza.', explanation: 'The past continuous tense is formed with "were" + verb-ing.' },
        { id: 7, grade: selectedGrade, words: ['is', 'The', 'under', 'cat', 'the', 'table'], correctSentence: 'The cat is under the table.', explanation: 'The preposition "under" is used to describe location.' },
        { id: 8, grade: selectedGrade, words: ['always', 'She', 'walks', 'quickly'], correctSentence: 'She always walks quickly.', explanation: 'The adverb of frequency "always" comes before the main verb.' },
        { id: 9, grade: selectedGrade, words: ['repaired', 'car', 'I', 'had', 'my'], correctSentence: 'I had my car repaired.', explanation: 'The causative structure "had + object + past participle" is used.' },
        { id: 10, grade: selectedGrade, words: ['reading', 'interested', 'in', 'I\'m', 'history'], correctSentence: 'I\'m interested in reading history.', explanation: 'The preposition "in" is followed by the gerund "reading".' },
      ];
      setSentenceData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const nextSentence = async () => {
    if (isLocked) return;

    const currentSentence = sentenceData[currentSentenceIndex];
    if (currentSentence && showAnswer) {
      try {
        const prompt = `Evaluate learning for grades ${selectedGrade}. Sentence words: "${currentSentence.words.join(', ')}". Correct sentence: "${currentSentence.correctSentence}". Explanation: "${currentSentence.explanation}". The student has reviewed this sentence. Provide a score from 0-10 based on learning effectiveness. Format as JSON: { "score": number, "feedback": "string" }`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        const evaluation = JSON.parse(text);

        const pointsEarned = evaluation.score * 2;
        const newProgress = Math.min(progress + pointsEarned, 100);
        setProgress(newProgress);

        if (evaluation.score >= 9) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#00BFFF'],
            shapes: ['star', 'circle'],
            scalar: 1.2
          });
        }
      } catch (error) {
        console.error('Error evaluating sentence:', error);
      }
    }

    if (currentSentenceIndex < sentenceData.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setShowAnswer(false);
    } else {
      handleCompleteChallenge();
      setCanReattempt(attempts < 1);
    }
  };

  const toggleAnswer = () => {
    if (isLocked) return;
    setShowAnswer(!showAnswer);
  };

  const currentSentence = sentenceData[currentSentenceIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 p-8 flex items-center justify-center">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 p-8">
      {/* UPDATED: Deep Cosmic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          // UPDATED: Glassmorphic header panel
          className="bg-black/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-indigo-500/30 border border-indigo-500/50"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigate('/what-if')}
              // UPDATED: Glassmorphic button
              className="flex items-center gap-2 bg-black/40 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              Back to Challenges
            </motion.button>
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Grade Level:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                // UPDATED: Glassmorphic select
                className="px-4 py-2 rounded-xl bg-black/40 text-white border border-white/20 focus:ring-amber-400 focus:border-amber-400"
              >
                <option value="4-6">4-6 (Beginner)</option>
                <option value="7-9">7-9 (Intermediate)</option>
                <option value="10-12">10-12 (Advanced)</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center gap-4">
            <Brain className="text-amber-400 drop-shadow-lg" size={48} />
            Sentence Builder Challenge
          </h1>
          <p className="text-lg text-white/80 mb-6 text-center">Construct sentences with the given words!</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Progress</span>
              <span>{currentSentenceIndex + 1} / {sentenceData.length}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full shadow-lg shadow-amber-500/50"
                initial={{ width: 0 }}
                animate={{ width: `${((currentSentenceIndex + 1) / sentenceData.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Sentence Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSentenceIndex}
            // UPDATED: Glassmorphic card container, REMOVED BENDING
            className="bg-black/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-amber-500/30 border border-amber-500/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            {currentSentence && (
              <div className="text-center space-y-6">
                <motion.div
                  // UPDATED: Glassmorphic inner card, REMOVED BENDING
                  className="bg-white/10 p-8 rounded-2xl border border-white/10 shadow-lg"
                  whileHover={{ scale: 1.01 }}
                >
                  <h2 className="text-4xl font-bold text-orange-300 mb-2">{currentSentence.words.join(', ')}</h2>
                </motion.div>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10 shadow-md">
                      <h3 className="text-xl font-semibold text-white mb-2">Correct Sentence</h3>
                      <p className="text-white/80 font-mono">{currentSentence.correctSentence}</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10 shadow-md">
                      <h3 className="text-xl font-semibold text-white mb-2">Explanation</h3>
                      <p className="text-white/80 italic">{currentSentence.explanation}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={toggleAnswer}
                    // UPDATED: Neon button style
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-cyan-500/40 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </motion.button>
                  <motion.button
                    onClick={nextSentence}
                    // UPDATED: Neon button style
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-green-500/40 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentSentenceIndex < sentenceData.length - 1 ? 'Next Sentence' : 'Complete Challenge'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Completion Screen */}
        {showCompletion && (
          <motion.div
            // UPDATED: Glassmorphic completion screen
            className="bg-black/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-amber-500/30 border border-amber-500/50 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <div className="text-6xl mb-4 text-yellow-400">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Challenge Completed!</h2>
              <p className="text-white/80 text-lg mb-6">
                Great job! You've successfully completed the Sentence Builder Challenge.
              </p>

              <div className="bg-white/10 p-6 rounded-2xl mb-6 border border-white/10">
                <div className="text-white/70 text-sm mb-2">Today's Attempts</div>
                <div className="text-2xl font-bold text-orange-300">{attempts}/2</div>
              </div>

              <div className="flex gap-4 justify-center">
                {canReattempt && (
                  <motion.button
                    onClick={handleReattempt}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-cyan-500/40 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again ({2 - attempts} attempts left)
                  </motion.button>
                )}

                <motion.button
                  onClick={() => navigate('/what-if')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-green-500/40 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  >
                    Back to Challenges
                  </motion.button>
                </div>

                {attempts >= 2 && (
                  <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl mt-6">
                    <p className="text-red-300 text-sm">
                      🔒 Challenge locked for today. Come back tomorrow for a fresh challenge!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

export default SentenceBuilderChallenge;
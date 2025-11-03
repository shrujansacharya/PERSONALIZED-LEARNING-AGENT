import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ArrowLeft, Star, Trophy, Rotate3D } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { GeminiService } from '../lib/gemini-service';
import { useThemeStore } from '../store/theme';
import confetti from 'canvas-confetti';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Initialize Gemini Service
const geminiService = GeminiService;

export const GrammarChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [grammarRules, setGrammarRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(location.state?.grade || '4-6');
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReattempt, setCanReattempt] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [answered, setAnswered] = useState(false);

  // Theme state from the store
  const { getThemeStyles } = useThemeStore();
  const theme = getThemeStyles();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || (theme.backgrounds && theme.backgrounds.length > 0 ? theme.backgrounds[0] : '');

  const fallbackProfile = {
    user_id: 'test-user-id',
    username: 'Student',
    points: 0,
    time_spent: {},
    completed_activities: [],
    progress: { vocabulary: 0, grammar: 0, conversation: 0, pronunciation: 0, reading: 0, writing: 0 },
    daily_challenges_progress: { vocabulary: 0, grammar: 0, conversation: 0, pronunciation: 0, reading: 0, writing: 0 },
    badges: []
  };

  useEffect(() => {
    fetchProfile();
    checkAttempts();
    loadProgress();
    generateGrammarChallenge();
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGrade, theme.backgrounds]);

  useEffect(() => {
    if (grammarRules.length > 0) {
      saveProgress();
    }
  }, [currentRuleIndex, grammarRules.length]);

  useEffect(() => {
    setUserAnswer('');
    setFeedback('');
    setAnswered(false);
  }, [currentRuleIndex]);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          setProfile(fallbackProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfile(fallbackProfile);
      }
    } else {
      setProfile(fallbackProfile);
    }
  };

  const checkAttempts = () => {
    const today = new Date().toDateString();
    const attemptKey = `grammar-attempts-${today}`;
    const completionKey = `grammar-completed-${today}`;
    const stored = localStorage.getItem(attemptKey);
    const completed = localStorage.getItem(completionKey) === 'true';

    setCompletedToday(completed);

    if (stored) {
      const attemptData = JSON.parse(stored);
      setAttempts(attemptData.attempts || 0);
      setIsLocked(attemptData.attempts >= 2 || completed);
    } else {
      localStorage.removeItem('grammar-attempts-' + new Date(Date.now() - 86400000).toDateString());
      localStorage.removeItem('grammar-completed-' + new Date(Date.now() - 86400000).toDateString());
      setAttempts(0);
      setIsLocked(completed);
    }
  };

  const saveAttempt = () => {
    const today = new Date().toDateString();
    const attemptKey = `grammar-attempts-${today}`;
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

  const saveProgress = () => {
    const progressData = {
      currentRuleIndex,
      grade: selectedGrade,
    };
    localStorage.setItem('grammarChallengeProgress', JSON.stringify(progressData));
  };

  const loadProgress = () => {
    const savedProgress = localStorage.getItem('grammarChallengeProgress');
    if (savedProgress) {
      const { currentRuleIndex: savedIndex, grade } = JSON.parse(savedProgress);
      if (grade === selectedGrade) {
        setCurrentRuleIndex(savedIndex);
      }
    }
  };

  const resetChallenge = () => {
    setCurrentRuleIndex(0);
    setShowCompletion(false);
    setCanReattempt(false);
    generateGrammarChallenge();
  };

  const handleReattempt = () => {
    if (attempts < 2) {
      saveAttempt();
      resetChallenge();
    }
  };

  const generateGrammarChallenge = async () => {
    setLoading(true);
    const today = new Date().toDateString();
    const level = selectedGrade === '4-6' ? 'Beginner' : selectedGrade === '7-9' ? 'Intermediate' : 'Advanced';
    const cacheKey = `grammar-challenge-${today}-${selectedGrade}`;

    const cachedChallenge = localStorage.getItem(cacheKey);
    if (cachedChallenge) {
      setGrammarRules(JSON.parse(cachedChallenge));
      setLoading(false);
      return;
    }

    try {
      const prompt = `You are a JSON generator. Generate exactly 8 unique, simple grammar rules for ${level} level (grades ${selectedGrade}). Rules should be appropriate for the grade level. Today's date is ${today} - use this to ensure the generated rules are unique for today and different from previous days. Return the response in the following JSON format:
[
  { "id": number, "grade": string, "title": string, "rule": string, "example": string, "structure": string, "exercise": string, "expected": string }, ...
]`;

      const text = await geminiService.generateText(prompt);

      let cleanedText = text.trim().replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) cleanedText = jsonMatch[0];

      try {
        const data = JSON.parse(cleanedText);
        if (Array.isArray(data) && data.length > 0) {
          setGrammarRules(data);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError, 'Raw response:', text);
        setGrammarRules(getFallbackGrammarRules(selectedGrade));
      }
    } catch (error) {
      console.error('Error generating grammar rules:', error);
      setGrammarRules(getFallbackGrammarRules(selectedGrade));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackGrammarRules = (grade: string) => {
    return grade === '4-6' ? [
        { id: 1, grade, title: 'Simple Present Tense', rule: 'Use the simple present tense for habits and facts.', example: 'She walks to school every day.', structure: 'subject + base verb (add -s for he/she/it)', exercise: 'He _____ to school every day.', expected: 'walks' },
        { id: 2, grade, title: 'Plural Nouns', rule: 'Add -s to make most nouns plural.', example: 'I have two cats.', structure: 'noun + -s', exercise: 'I have two _____.', expected: 'cats' },
        { id: 3, grade, title: 'Using "Is" and "Are"', rule: 'Use "is" for one person or thing, "are" for more than one.', example: 'The dog is happy. The dogs are happy.', structure: 'subject + is/are', exercise: 'The dogs _____ happy.', expected: 'are' },
        { id: 4, grade, title: 'Simple Past Tense', rule: 'Use the simple past tense for actions that happened before.', example: 'She played soccer yesterday.', structure: 'subject + verb + -ed (for regular verbs)', exercise: 'She _____ soccer yesterday.', expected: 'played' },
        { id: 5, grade, title: 'Adjectives', rule: 'Adjectives describe nouns.', example: 'The big dog barked.', structure: 'adjective + noun', exercise: 'The _____ dog barked.', expected: 'big' },
        { id: 6, grade, title: 'Using "Can"', rule: 'Use "can" to show ability.', example: 'I can swim.', structure: 'subject + can + base verb', exercise: 'I _____ swim.', expected: 'can' },
        { id: 7, grade, title: 'Possessive Adjectives', rule: 'Use possessive adjectives to show who owns something.', example: 'This is my book.', structure: 'possessive adjective + noun', exercise: 'This is _____ book.', expected: 'my' },
        { id: 8, grade, title: 'Question Words', rule: 'Use "what" to ask about things.', example: 'What is your name?', structure: 'What + is/are + subject', exercise: '_____ is your name?', expected: 'What' }
      ] : grade === '7-9' ? [
        { id: 1, grade, title: 'Present Continuous Tense', rule: 'Use for actions happening right now.', example: 'She is reading a book.', structure: 'subject + is/are + verb-ing', exercise: 'She _____ a book.', expected: 'is reading' },
        { id: 2, grade, title: 'Past Continuous Tense', rule: 'Use for actions that were ongoing in the past.', example: 'They were playing football.', structure: 'subject + was/were + verb-ing', exercise: 'They _____ football.', expected: 'were playing' },
        { id: 3, grade, title: 'Comparative Adjectives', rule: 'Use to compare two things.', example: 'This book is bigger than that one.', structure: 'adjective + -er + than', exercise: 'This book is _____ than that one.', expected: 'bigger' },
        { id: 4, grade, title: 'Modal Verbs: Must', rule: 'Use "must" for obligation.', example: 'You must finish your homework.', structure: 'subject + must + base verb', exercise: 'You _____ finish your homework.', expected: 'must' },
        { id: 5, grade, title: 'Prepositions of Place', rule: 'Use to describe location.', example: 'The cat is under the table.', structure: 'subject + is/are + preposition + noun', exercise: 'The cat is _____ the table.', expected: 'under' },
        { id: 6, grade, title: 'Simple Future Tense', rule: 'Use "will" for future actions.', example: 'I will call you later.', structure: 'subject + will + base verb', exercise: 'I _____ call you later.', expected: 'will' },
        { id: 7, grade, title: 'Possessive Pronouns', rule: 'Use to show ownership without repeating the noun.', example: 'This book is mine.', structure: 'subject + is/are + possessive pronoun', exercise: 'This book is _____.', expected: 'mine' },
        { id: 8, grade, title: 'Adverbs of Frequency', rule: 'Use to describe how often something happens.', example: 'She always walks to school.', structure: 'subject + adverb + verb', exercise: 'She _____ walks to school.', expected: 'always' }
      ] : [
        { id: 1, grade, title: 'Perfect Continuous Tenses', rule: 'Describe actions that started in the past and continue.', example: 'I have been studying for hours.', structure: 'have/has + been + verb-ing', exercise: 'I _____ studying for hours.', expected: 'have been' },
        { id: 2, grade, title: 'Subjunctive Mood', rule: 'Expresses wishes or hypothetical situations.', example: 'I wish I were taller.', structure: 'If + subject + were + infinitive', exercise: 'I wish I _____ taller.', expected: 'were' },
        { id: 3, grade, title: 'Causative Verbs', rule: 'Used when someone causes another to do something.', example: 'I had my car repaired.', structure: 'have/get + object + past participle', exercise: 'I had my car _____.', expected: 'repaired' },
        { id: 4, grade, title: 'Inversion in Conditionals', rule: 'Used in formal hypothetical situations.', example: 'Were I rich, I would travel.', structure: 'Were + subject + infinitive', exercise: 'Were I rich, I _____ travel.', expected: 'would' },
        { id: 5, grade, title: 'Reported Speech with Modals', rule: 'Modals change in reported speech.', example: 'He said he could help.', structure: 'could/would/should/might + base verb', exercise: 'He said he _____ help.', expected: 'could' },
        { id: 6, grade, title: 'Complex Gerund Phrases', rule: 'Gerunds used with prepositions.', example: 'I\'m interested in learning history.', structure: 'preposition + gerund', exercise: 'I\'m interested in _____ history.', expected: 'learning' },
        { id: 7, grade, title: 'Participle Clauses', rule: 'Reduce relative clauses using participles.', example: 'The man living next door is a doctor.', structure: 'present participle + subject', exercise: 'The man _____ next door is a doctor.', expected: 'living' },
        { id: 8, grade, title: 'Emphasis with Inversion', rule: 'Invert subject and auxiliary for emphasis.', example: 'Never have I seen such beauty.', structure: 'Never + auxiliary + subject + verb', exercise: 'Never _____ I seen such beauty.', expected: 'have' }
    ];
  };

  const verifyAnswer = async () => {
    if (!userAnswer || !currentRule) return;
    
    setAnswered(true);
    setFeedback('Evaluating...');

    const isLocallyCorrect = userAnswer.toLowerCase().trim() === currentRule.expected.toLowerCase().trim();

    if (isLocallyCorrect) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#FFD700', '#FF69B4'] });
      setProgress(prev => Math.min(prev + 20, 100));
    } else {
      setProgress(prev => Math.min(prev + 5, 100));
    }

    try {
      const prompt = `You are a JSON generator. A student is doing a grammar exercise. The correct answer is "${currentRule.expected}" and the student answered "${userAnswer}". Return a JSON object with detailed, constructive feedback in 2-3 sentences appropriate for a ${selectedGrade} grade level. The JSON should have one key: "feedback". Example: { "feedback": "Great job! Your answer is correct." }`;

      const text = await geminiService.generateText(prompt);
      
      let cleanedText = text.trim().replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleanedText = jsonMatch[0];

      const evaluation = JSON.parse(cleanedText);
      setFeedback(evaluation.feedback || "Feedback received.");

    } catch (error) {
      console.error('Error verifying answer with AI:', error);
      setFeedback(isLocallyCorrect ? 'Correct!' : `Good try! The expected answer was "${currentRule.expected}".`);
    }
  };

  const nextRule = () => {
    if (currentRuleIndex < grammarRules.length - 1) {
      setCurrentRuleIndex(currentRuleIndex + 1);
    } else {
      const today = new Date().toDateString();
      const completionKey = `grammar-completed-${today}`;
      localStorage.setItem(completionKey, 'true');
      setCompletedToday(true);
      setIsLocked(true);
      localStorage.removeItem('grammarChallengeProgress');

      confetti({
        particleCount: 200, spread: 120, origin: { y: 0.6 },
        colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'],
        shapes: ['circle', 'square'], scalar: 1.2
      });
      setShowCompletion(true);
      setCanReattempt(true);
    }
  };

  const currentRule = grammarRules[currentRuleIndex];

  const ScrambleText = ({ text }: { text: string }) => {
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
      let counter = 0;
      const interval = setInterval(() => {
        const newText = text
          .split('')
          .map((char, index) => {
            if (index < counter) return text[index];
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        setDisplayText(newText);
        
        if (counter >= text.length) clearInterval(interval);
        
        counter += 1 / 3;
      }, 30);

      return () => clearInterval(interval);
    }, [text]);

    return <span>{displayText}</span>;
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
              className="absolute rounded-full bg-purple-400"
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
              <BookOpen className="text-purple-400 w-16 h-16" />
            </motion.div>
            <motion.div
              className="absolute top-0 left-0 w-full h-0.5 bg-cyan-300/80"
              style={{ boxShadow: '0 0 8px #67e8f9' }}
              animate={{ y: [0, 64], opacity: [0.8, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "circIn" }}
            />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3 font-mono tracking-wide">
             <ScrambleText text="Crafting Your Adventure!" />
          </h2>

          <p className="text-white/70 text-lg mb-6">
            Generating personalized exercises...
          </p>

          <div className="w-full bg-white/10 rounded-full h-2.5 mb-6 overflow-hidden">
             <motion.div
               className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full"
               initial={{ width: '0%' }}
               animate={{ width: '100%' }}
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
             />
          </div>

          <motion.div
            className="text-purple-300 text-sm font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            🚀 Get ready to level up your grammar skills!
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
        <motion.div
          className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Trophy className="text-yellow-400 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-white mb-4">Challenge Completed!</h2>
          <p className="text-white/80 mb-6">Great job! You've improved your grammar skills.</p>
          <p className="text-white text-lg mb-6">Your grammar progress: {progress}%</p>
          {canReattempt && !isLocked && (
            <motion.button
              onClick={handleReattempt}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              Reattempt Challenge
            </motion.button>
          )}
          {isLocked && (
            <p className="text-white/80">You've reached the daily attempt limit. Come back tomorrow!</p>
          )}
          <motion.button
            onClick={() => navigate(-1)}
            className="mt-4 text-white underline"
            whileHover={{ scale: 1.05 }}
          >
            Previous Page
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div
          className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
            >
              <ArrowLeft size={20} />
              Previous Page
            </button>
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Grade Level:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20"
              >
                <option value="4-6">4-6 (Beginner)</option>
                <option value="7-9">7-9 (Intermediate)</option>
                <option value="10-12">10-12 (Advanced)</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center gap-4">
            <BookOpen className="text-purple-400" size={48} />
            Grammar Practice
          </h1>
          <p className="text-lg text-white/80 mb-6">Master grammar rules with fun and simple exercises!</p>

          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Progress</span>
              <span>{currentRuleIndex + 1} / {grammarRules.length}</span>
            </div>
            <div className="bg-white/10 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                animate={{ width: `${((currentRuleIndex + 1) / (grammarRules.length || 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRuleIndex}
            className="bg-black/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, rotateX: -20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 20 }}
            transition={{ duration: 0.8 }}
          >
            {currentRule && (
              <div className="space-y-6">
                <motion.div
                  className="bg-white/5 p-8 rounded-2xl text-center"
                >
                  <h2 className="text-3xl font-bold text-white mb-2">{currentRule.title}</h2>
                  <p className="text-white/80 text-lg">{currentRule.rule}</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white mb-3">Example</h3>
                    <p className="text-white/80 italic">"{currentRule.example}"</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white mb-3">Structure</h3>
                    <p className="text-white/80 font-mono">{currentRule.structure}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-white mb-3">Exercise</h3>
                  <p className="text-white/80 mb-4">{currentRule.exercise}</p>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-400 outline-none"
                    placeholder="Fill in the blank..."
                    disabled={answered}
                  />
                </div>

                {feedback && (
                  <div className="bg-green-500/20 text-green-100 p-4 rounded-xl">
                    <strong>Feedback:</strong> {feedback}
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <motion.button
                    onClick={verifyAnswer}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    disabled={!userAnswer || answered}
                  >
                    Submit Answer
                  </motion.button>
                  <motion.button
                    onClick={nextRule}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    disabled={!answered}
                  >
                    {currentRuleIndex < grammarRules.length - 1 ? 'Next Rule' : 'Complete Challenge'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GrammarChallenge;
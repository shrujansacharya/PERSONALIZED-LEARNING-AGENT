// GuidedPracticePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, ArrowLeft, RefreshCw, User, Bot, MessageSquare, Brain, BookOpen, MessageSquare as MessageSquareIcon, Mic as MicIcon, Award, Star, Trophy, Flame, Zap, Sparkles, Coffee, Target, Volume, Play, Pause, Globe, Headphones, Lightbulb, Heart, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { GeminiService } from '../lib/gemini-service';

export const GuidedPracticePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useThemeStore((state) => state.getThemeStyles());
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<{ role: 'user' | 'bot' | 'feedback', text: string }[]>([]);
  const [status, setStatus] = useState('Press the microphone to start speaking...');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [currentLevel, setCurrentLevel] = useState(location.state?.level || 'Beginner');
  const currentMode = 'guided'; // Fixed to guided
  const [isServiceReady, setIsServiceReady] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

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

    setStatus('Initializing Gemini API...');
    setIsServiceReady(true);

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

  useEffect(() => {
    const setInitialContent = async () => {
      let welcomeMessage = '';

      switch (currentLevel) {
        case 'Beginner':
          welcomeMessage = 'Welcome to your English speaking practice! We will start with basic topics. Let\'s begin simply: Can you introduce yourself? Say your name and where you are from.';
          break;
        case 'Intermediate':
          welcomeMessage = 'Welcome to your English speaking practice! We will build on intermediate skills. Let\'s start: Tell me about your daily routine.';
          break;
        case 'Advanced':
          welcomeMessage = 'Welcome to your English speaking practice! We will tackle advanced topics. Let\'s begin: Discuss a current event that interests you.';
          break;
        default:
          welcomeMessage = 'Welcome to your English speaking practice! Let\'s start with a simple question: Can you tell me about your favorite hobby?';
      }

      setConversation([{ role: 'bot', text: welcomeMessage }]);
      speakText(welcomeMessage);
      setStatus('Speech recognition ready. Click the microphone to practice speaking.');
    };

    setInitialContent();
  }, [currentLevel]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Stop speech synthesis when component unmounts (user exits page)
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size);
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob created:', audioBlob.size);
        await handleAudioTranscription(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Recording... Speak now!');
      console.log('Recording started');
    } catch (error: unknown) {
      console.error('Error starting recording:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setStatus('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setStatus('No microphone found. Please connect a microphone and try again.');
        } else {
          setStatus('Failed to start recording. Please check microphone permissions.');
        }
      } else {
        setStatus('Failed to start recording. Please check microphone permissions.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording, isRecording:', isRecording);
    if (mediaRecorderRef.current && isRecording) {
      console.log('Calling mediaRecorder.stop()');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing your speech with Gemini API...');
    } else {
      console.log('Cannot stop recording: mediaRecorder or isRecording is false');
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    try {
      const transcription = await GeminiService.transcribeAudio(audioBlob);
      if (transcription) {
        await handleSpeechResult(transcription);
      } else {
        setStatus('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setStatus('Error processing audio. Please try again.');
    }
  };

  const handleSpeechResult = async (transcription: string) => {
    setConversation((prev) => [...prev, { role: 'user', text: transcription }]);
    setStatus('Analyzing your speech...');

    try {
      let feedback = '';
      let response = '';

      // Use last bot message as expected text for feedback
      const lastBotMessage = conversation.slice().reverse().find(msg => msg.role === 'bot')?.text || '';

      feedback = await GeminiService.generateFeedback(transcription, lastBotMessage, currentLevel);
      response = await GeminiService.generateResponse(transcription, currentLevel, currentMode);

      setConversation((prev) => [
        ...prev,
        { role: 'feedback', text: feedback },
        { role: 'bot', text: response },
      ]);

      speakText(response);
      setStatus('Listen to the AI response and speak again!');
    } catch (err: any) {
      console.error('Error processing speech:', err);
      setConversation((prev) => [...prev, { role: 'feedback', text: 'Error analyzing speech. Please try again.' }]);
      setStatus('Click the microphone to try again.');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser.');
      setStatus('Text-to-speech not supported. Please use a compatible browser.');
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLevel(e.target.value);
    setConversation([]);
    setStatus('Changing level...');
  };

  const clearConversation = () => {
    setConversation([]);
    setStatus('Conversation cleared. Start speaking!');
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
            onClick={() => navigate('/what-if', { state: { level: currentLevel } })}
            // UPDATED: Glassmorphic button, neon hover border
            className="flex items-center gap-3 text-white/70 hover:text-cyan-400 transition-all duration-300 p-4 rounded-2xl bg-black/40 backdrop-blur-lg border border-indigo-400/30 hover:bg-white/10 hover:border-cyan-400/50 shadow-lg"
            whileHover={{ scale: 1.05, rotate: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} />
            <span className="text-sm font-medium hidden md:inline">Back</span>
          </motion.button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <select
                value={currentLevel}
                onChange={handleLevelChange}
                // UPDATED: Glassmorphic select
                className="px-6 py-3 text-sm rounded-2xl bg-black/40 text-white border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-lg appearance-none bg-no-repeat bg-right pr-10 shadow-lg"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <ChevronRight size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>
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
            Guided <span className="text-5xl">Practice</span>
          </motion.h1>
          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Practice guided English conversations with AI feedback. Powered by Gemini API.
          </p>
        </motion.div>

        {/* Main Practice Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Options Panel */}
          <motion.div
            // UPDATED: Glassmorphic panel, subtle neon border/shadow
            className="lg:col-span-1 bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20"
            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(168,85,247,0.3)" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Settings size={32} className="text-black" />
              </motion.div>
              <div>
                <h3 className="text-3xl font-bold">Options</h3>
                <p className="text-white/60">Customize your practice</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-white text-sm mb-3 block font-medium">Select Level</label>
                <select
                  value={currentLevel}
                  onChange={handleLevelChange}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-black/40 text-white border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-lg shadow-lg"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <motion.button
                onClick={clearConversation}
                className="w-full py-4 rounded-2xl font-bold transition-all duration-300 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/25 border border-red-500/30"
                whileTap={{ scale: 0.95 }}
              >
                Clear Conversation
              </motion.button>
            </div>
          </motion.div>

          {/* Conversation Area */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              // UPDATED: Glassmorphic panel
              className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">AI Conversation</h2>
                <p className="text-white/70">Speak naturally and receive instant feedback</p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10 space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {conversation.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                          {msg.role === 'bot' ? <Bot className="text-white" size={24} /> : <User className="text-white" size={24} />}
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl max-w-[75%] shadow-lg ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                            : msg.role === 'bot'
                            ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-bl-none'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-bl-none'
                        }`}
                      >
                        <div className="font-semibold mb-1">
                          {msg.role === 'user' ? 'You:' : msg.role === 'bot' ? 'AI Tutor:' : 'Feedback:'}
                        </div>
                        {msg.text}
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <User className="text-white" size={24} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={conversationEndRef} />
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/30 shadow-2xl shadow-pink-500/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">Voice Controls</p>
                  <p className="text-white/70">{status}</p>
                </div>

                <div className="flex items-center justify-center">
                  <motion.button
                    onClick={() => {
                      console.log('Button clicked, isRecording:', isRecording);
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`p-8 rounded-full shadow-2xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-purple-500'} hover:opacity-90 transition-all`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={status.includes('Error') || status.includes('Microphone access denied') || !isServiceReady}
                  >
                    <Mic size={48} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
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
              Initializing Practice...
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


    </div>
  );
};

export default GuidedPracticePage;

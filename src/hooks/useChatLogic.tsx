import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../lib/firebase';
import { useThemeStore } from '../store/theme';
import type { Message, Subject, UserData, RelatedVideo, ChatSession, SessionsBySubject } from '../types';
import {
  fetchYouTubeVideos,
  sanitizeContent,
  cleanTextForTTS,
  subjectThematicInstructions,
  performanceInstructions,
  updateProgress,
  newWelcome,
  saveSessions,
} from '../utils/chatUtils';

// Reducer for chat state
interface ChatState {
  messages: Message[];
  loading: boolean;
  recommendedMessages: string[];
  hasReceivedInitialExplanation: boolean;
  lastExplainedConcept: string | null;
}

type ChatAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECOMMENDATIONS'; payload: string[] }
  | { type: 'SET_INITIAL_EXPLANATION'; payload: boolean }
  | { type: 'SET_LAST_CONCEPT'; payload: string | null };

const initialChatState: ChatState = {
  messages: [],
  loading: false,
  recommendedMessages: [],
  hasReceivedInitialExplanation: false,
  lastExplainedConcept: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendedMessages: action.payload };
    case 'SET_INITIAL_EXPLANATION':
      return { ...state, hasReceivedInitialExplanation: action.payload };
    case 'SET_LAST_CONCEPT':
      return { ...state, lastExplainedConcept: action.payload };
    default:
      return state;
  }
};

interface UseChatLogicProps {
  selectedSubject: Subject | null;
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  initialContext?: string;
  materialComment?: string;
  sessionsBySubject: SessionsBySubject;
  setSessionsBySubject: (s: SessionsBySubject) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameValue: string;
  setRenameValue: (v: string) => void;
  newMessage: string;
  setNewMessage: (m: string) => void;
  onLoadSession?: (session: ChatSession) => void;
  onStartNewChat?: () => void;
  onBeginRename?: (session: ChatSession) => void;
  onCommitRename?: (session: ChatSession) => void;
}

export const useChatLogic = (props: UseChatLogicProps) => {
  const {
    selectedSubject,
    userData,
    setUserData,
    initialContext,
    materialComment,
    sessionsBySubject,
    setSessionsBySubject,
    currentSessionId,
    setCurrentSessionId,
    renamingId,
    setRenamingId,
    renameValue,
    setRenameValue,
    newMessage,
    setNewMessage,
    onLoadSession,
    onStartNewChat,
    onBeginRename,
    onCommitRename
  } = props;

  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [userLearningStyle, setUserLearningStyle] = useState('read/write');
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const theme = useThemeStore();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [performanceLevel, setPerformanceLevel] = useState('average');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  const fetchUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json() as UserData;
          setUserData(data);
          setUserLearningStyle(data?.learningStyle?.toLowerCase() || 'read/write');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  }, [setUserData]);

  const getRecommendations = useCallback((botReply: string): string[] => {
    const lowerReply = botReply.toLowerCase();
    const recommendations: string[] = [];
    if (!state.hasReceivedInitialExplanation) recommendations.push("Can you explain it with my theme?");
    if (lowerReply.includes("how can i help")) recommendations.push("Explain this concept", "Help me with my homework", "Can you quiz me?");
    if (recommendations.length === 0) {
      recommendations.push("Tell me more", "Can you give me an example?", "Quiz me on this");
    }
    return recommendations.slice(0, 3);
  }, [state.hasReceivedInitialExplanation]);

  const speakText = useCallback((text: string) => {
    if (userLearningStyle === 'auditory') {
      speechSynthesis.cancel();
      const cleanedText = cleanTextForTTS(text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);

      utterance.onstart = () => { setIsSpeaking(true); setIsSpeechPaused(false); };
      utterance.onpause = () => { setIsSpeechPaused(true); };
      utterance.onresume = () => { setIsSpeechPaused(false); };
      utterance.onend = () => { setIsSpeaking(false); setIsSpeechPaused(false); };
      utterance.onerror = () => { setIsSpeaking(false); setIsSpeechPaused(false); };

      speechSynthesis.speak(utterance);
    }
  }, [userLearningStyle]);
  
  const toggleSpeech = useCallback(() => {
    if (speechSynthesis.speaking) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      } else {
        speechSynthesis.pause();
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const startTypingAnimation = useCallback((text: string, videoList?: RelatedVideo[], extractedMath?: string) => {
    dispatch({ type: 'SET_LOADING', payload: false });
    const botMessage: Message = {
      id: uuidv4(),
      text,
      isBot: true,
      timestamp: new Date().toISOString(),
      extractedMath: extractedMath || undefined,
      videoList: videoList || undefined,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: botMessage });
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: getRecommendations(text) });
    speakText(text);
  }, [getRecommendations, speakText]);

  const generateBotResponse = useCallback(async (inputText: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: [] });

    console.log('--- NEW RESPONSE ---');
    console.log('Current userLearningStyle:', userLearningStyle);

    const sanitizedMsg = sanitizeContent(inputText);
    if (!userData || !selectedSubject) {
        console.error("User data or subject not available for API call");
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
    }
    
    let systemInstructionText = `You are an expert AI tutor for ${selectedSubject.name}.
    **Brevity Rule:** Be concise and to the point. Provide a direct answer first, then a brief, step-by-step explanation.
    **Core Instruction:** Break down information into a point-wise format. Use headings and bullet points. **Bold key terms**.
    **Formatting Rule:** Do NOT use extra blank lines. Keep vertical spacing compact.`;

    const userInterests = userData.interests?.toLowerCase() || 'general topics';
    const userTheme = currentTheme || 'default';

    const performanceBasedInstruction = performanceInstructions[performanceLevel as keyof typeof performanceInstructions] || performanceInstructions.average;
    const learningStyleInstructions = {
        visual: `- VISUAL learner. Explain using descriptive language and analogies. Suggest up to 10 YouTube search queries.`,
        auditory: `- AUDITORY learner. Write in a clear, conversational, point-wise tone. Use bullet points.`,
        kinesthetic: `- KINESTHETIC learner. Use practical application and step-by-step instructions in a numbered list.`,
        'read/write': `- READ/WRITE learner. Use headings, bullet points, and **bolded keywords** to structure the information.`
    };
    const styleInstruction = learningStyleInstructions[userLearningStyle as keyof typeof learningStyleInstructions] || learningStyleInstructions['read/write'];
    
    systemInstructionText += `\n\n**STUDENT PROFILE:**\n${styleInstruction}\n- **Performance Level:** ${performanceLevel}. ${performanceBasedInstruction}\n- The student is interested in ${userInterests}. Use related analogies.`;

    const isThematicRequest = inputText.toLowerCase().includes("explain it with my theme");
    const isInitialAnalysis = state.messages.length <= 2;

    if ((isThematicRequest || isInitialAnalysis) && userTheme !== 'default') {
        const thematicInstruction = (subjectThematicInstructions[selectedSubject.id as keyof typeof subjectThematicInstructions] as any)?.[userTheme.toLowerCase()] || null;
        if (thematicInstruction) {
            systemInstructionText += `\n\n**THEMATIC EXPLANATION REQUIRED:** You MUST explain the topic using the student's current theme, which is **'${userTheme}'**. Follow these theme-specific rules: ${thematicInstruction}`;
        }
    }
    
    if (['mathematics', 'physics', 'chemistry'].includes(selectedSubject.id)) {
        systemInstructionText += `\n- For math problems, use LaTeX and show work in a step-by-step list.`;
    }

    try {
        const historyForApi = state.messages.filter(msg => msg.text.trim() !== '').map(msg => ({
            role: msg.isBot ? 'model' : 'user',
            parts: [{ text: sanitizeContent(msg.text) }],
        }));
        
        const backendResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
            history: historyForApi,
            message: sanitizedMsg,
            systemInstruction: sanitizeContent(systemInstructionText),
        });

        let botReply = backendResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || `Sorry, I couldn't understand.`;

        console.log("[DEBUG] Full AI Response Text:\n", botReply);

        let mainExplanationLines: string[] = [];
        let suggestedQueries: string[] = [];
        botReply.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            const queryMatch = trimmedLine.match(/"(.*?)"/);
            
            if (queryMatch && queryMatch[1] && trimmedLine.length < queryMatch[1].length + 15) {
                console.log(`[DEBUG] Found a potential query: "${queryMatch[1]}"`);
                suggestedQueries.push(queryMatch[1]);
            } else {
                mainExplanationLines.push(line);
            }
        });
        
        console.log("[DEBUG] Final array of extracted queries:", suggestedQueries);

        let videoList: RelatedVideo[] | null = null;
        if (userLearningStyle === 'visual' && suggestedQueries.length > 0) {
            console.log("[DEBUG] Visual learner detected with queries. Fetching videos...");
            const queriesForThumbnails = suggestedQueries.slice(0, 6);
            const videoPromises = queriesForThumbnails.map(query => fetchYouTubeVideos(query, 1));
            const results = await Promise.all(videoPromises);
            videoList = results.flat().filter(Boolean) as RelatedVideo[];
            
            console.log("[DEBUG] Fetched videos:", videoList);

            const queriesForReference = suggestedQueries.slice(6);
            if (queriesForReference.length > 0) {
                mainExplanationLines.push("\n\n---");
                mainExplanationLines.push("### For Further Research:");
                queriesForReference.forEach(q => mainExplanationLines.push(`- You can also search for: "${q}"`));
            }
        } else {
             console.log(`[DEBUG] SKIPPING video fetch. Style is '${userLearningStyle}'. Queries found: ${suggestedQueries.length}`);
        }
        
        botReply = mainExplanationLines.join('\n').trim();

        startTypingAnimation(botReply, videoList || undefined, undefined);
        dispatch({ type: 'SET_LAST_CONCEPT', payload: inputText });
        dispatch({ type: 'SET_INITIAL_EXPLANATION', payload: true });

    } catch (error) {
        console.error("API call failed:", error);
        const errorMessage: Message = { id: uuidv4(), text: "Sorry, something went wrong with the AI assistant. Please try again.", isBot: true, timestamp: new Date().toISOString() };
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        dispatch({ type: 'SET_LOADING', payload: false });
    }
}, [userData, selectedSubject, state.messages, userLearningStyle, performanceLevel, currentTheme, startTypingAnimation]);

  const handleSend = useCallback(async (e: React.FormEvent<HTMLFormElement>, messageOverride?: string) => {
    e.preventDefault();
    const msg = messageOverride || newMessage;
    if (!msg.trim()) return;
    const userMsg: Message = { id: uuidv4(), text: msg, isBot: false, timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    setNewMessage('');
    await generateBotResponse(msg);
  }, [newMessage, setNewMessage, generateBotResponse]);

  const handleRecommendationClick = useCallback((message: string) => {
    const userMsg: Message = { id: uuidv4(), text: message, isBot: false, timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    generateBotResponse(message);
  }, [generateBotResponse]);

  useEffect(() => {
    if (initialContext && selectedSubject && userData && state.messages.length === 0) {
      const analyzingText = `Analyzing your teacher's material...`;
      const welcomeMsg = newWelcome(selectedSubject.name);
      const analyzingMsg: Message = { id: uuidv4(), text: analyzingText, isBot: true, timestamp: new Date().toISOString() };
      dispatch({ type: 'SET_MESSAGES', payload: [welcomeMsg, analyzingMsg] });
      const analysisPrompt = `Please provide a comprehensive explanation of the following material. ${materialComment ? `My teacher's comment is: "${materialComment}".` : ''} Here is the content:\n\n${initialContext}`;
      generateBotResponse(analysisPrompt);
    }
  }, [initialContext, selectedSubject, userData, materialComment, generateBotResponse]);
  
  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };
        recognition.onresult = (event: any) => {
          setNewMessage(event.results[0][0].transcript);
        };
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.error("SpeechRecognition API not supported.");
      }
    }
  }, [isRecording, setNewMessage]);

  // --- THIS UNUSED FUNCTION HAS BEEN REMOVED ---
  // const toggleAudio = useCallback(() => { ... });

  const loadSession = useCallback((session: ChatSession) => {
    dispatch({ type: 'SET_MESSAGES', payload: session.messages });
    setCurrentSessionId(session.id);
    onLoadSession?.(session);
  }, [onLoadSession, setCurrentSessionId]);

  const startNewChatSameSubject = useCallback(() => {
    if (selectedSubject) {
      dispatch({ type: 'SET_MESSAGES', payload: [newWelcome(selectedSubject.name)] });
      setCurrentSessionId(null);
      onStartNewChat?.();
    }
  }, [selectedSubject, onStartNewChat, setCurrentSessionId]);

  const beginRename = useCallback((session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.name);
    onBeginRename?.(session);
  }, [onBeginRename, setRenamingId, setRenameValue]);

  const commitRename = useCallback((session: ChatSession) => {
    if (!selectedSubject || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    const updatedSessions = (sessionsBySubject[selectedSubject.id] || []).map(s => 
        s.id === session.id ? { ...s, name: renameValue.trim() } : s
    );
    const newSessionsBySubject = { ...sessionsBySubject, [selectedSubject.id]: updatedSessions };
    setSessionsBySubject(newSessionsBySubject);
    saveSessions(newSessionsBySubject);
    setRenamingId(null);
    onCommitRename?.(session);
  }, [selectedSubject, sessionsBySubject, setSessionsBySubject, renameValue, onCommitRename, setRenamingId]);

  const handleFeedback = useCallback((msgId: string, feedback: 'good' | 'adjust') => {
    if (feedback === 'adjust') {
      const newPerf = performanceLevel === 'good' ? 'average' : 'weak';
      setPerformanceLevel(newPerf);
      const savedPerf = JSON.parse(localStorage.getItem('eduChat:userPerformance') || '{}');
      savedPerf[selectedSubject?.name || ''] = newPerf;
      localStorage.setItem('eduChat:userPerformance', JSON.stringify(savedPerf));
      handleSend({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, "I don't get it, please explain it simpler.");
    }
  }, [performanceLevel, selectedSubject, handleSend]);

  const onSpeak = useCallback((text: string) => {
    speakText(text);
  }, [speakText]);

  const renderPhET = useCallback((url: string) => (
    <iframe src={url} className="w-full h-64" title="PhET Sim" allowFullScreen />
  ), []);

  const renderActiveToolPanel = useCallback(() => (
    <div className="bg-black/70 p-4 rounded-t-xl border-b border-white/20">
      <p className="text-white text-sm">Tool panel for {activeTool}</p>
    </div>
  ), [activeTool]);
  
  // --- THE RETURN STATEMENT IS CLEANED UP ---
  return {
    state,
    userLearningStyle,
    currentBackgroundIndex,
    isRecording,
    audioRef,
    handleVoiceToggle,
    handleRecommendationClick,
    loadSession,
    startNewChatSameSubject,
    beginRename,
    commitRename,
    handleSend,
    fetchUserData,
    handleFeedback,
    onSpeak,
    renderPhET,
    currentTheme,
    setCurrentTheme,
    isOffline,
    performanceLevel,
    activeTool,
    setActiveTool,
    renderActiveToolPanel,
    isSpeaking,
    isSpeechPaused,
    toggleSpeech,
  };
};
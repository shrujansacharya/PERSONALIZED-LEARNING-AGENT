// Chatbot.tsx (Final completed version)
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from "react";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Sidebar component is now in-line, so we remove the import.
import Sidebar from './Sidebar';

import MessageList from './MessageList';
import MessageInput from './MessageInput';

const generatePDF = (directAnswerText: string, extractedMath?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const lineHeight = 10;
  const maxLineWidth = pageWidth - margin * 2;

  let y = margin;
  const addPageIfNeeded = () => {
    if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  if (directAnswerText && directAnswerText.trim()) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Direct Notes & Key Answers", margin, y);
    y += lineHeight + 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(directAnswerText, maxLineWidth);
    notesLines.forEach((line: string) => {
      addPageIfNeeded();
      doc.text(line, margin, y);
      y += lineHeight;
    });
  }

  if (extractedMath && extractedMath.trim()) {
    y += 20; 
    addPageIfNeeded();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Mathematical Content:", margin, y);
    y += lineHeight + 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const mathLines = doc.splitTextToSize(extractedMath, maxLineWidth);
    mathLines.forEach((line: string) => {
      addPageIfNeeded();
      doc.text(line, margin, y);
      y += lineHeight;
    });
  }
  
  doc.save("direct_notes.pdf");
};

import {
  Loader2,
  Send,
  PlusCircle,
  RotateCcw,
  Pencil,
  X,
  User,
  Search,
  Image as ImageIcon,
  Newspaper,
  Speech,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Paperclip,
  History as HistoryIcon,
  FolderOpen,
  List,
  Folder,
  Plus,
  SlidersHorizontal,
  Mic,
  ChevronsLeft,
  Pause,
  Play,
  Download,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../lib/firebase";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useThemeStore } from '../store/theme';
import chatbotimage from '../styles/chatbotimage.png';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Subject {
  id: string;
  name: string;
  category: string;
}

const subjects: Subject[] = [
  { id: "english", name: "English", category: "Academics" },
  { id: "kannada", name: "Kannada", category: "Academics" },
  { id: "mathematics", name: "Mathematics", category: "Academics" },
  { id: "science", name: "Science", category: "Academics" },
  { id: "social_science", name: "Social Studies", category: "Academics" },
  { id: "physics", name: "Physics", category: "Academics" },
  { id: "chemistry", name: "Chemistry", category: "Academics" },
  { id: "biology", name: "Biology", category: "Academics" },
  { id: "history", name: "History", category: "Academics" },
  { id: "python", name: "Python Programming", category: "Programming" },
  { id: "javascript", name: "JavaScript Basics", category: "Programming" },
  { id: "web_dev", name: "Web Development", category: "Programming" },
  { id: "data_science", name: "Data Science", category: "Programming" },
];

interface RelatedVideo {
  videoUrl: string;
  thumbnailUrl: string;
}

interface Message {
  text: string;
  isBot: boolean;
  timestamp: string;
  attachmentUrl?: string;
  videoList?: RelatedVideo[];
  title?: string;
  extractedMath?: string;
}

interface ChatSession {
  id: string;
  name: string;
  weekday: string;
  createdAt: string;
  messages: Message[];
}

interface Project {
  id: string;
  name: string;
  subjectId: string;
  messages: Message[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type SessionsBySubject = Record<string, ChatSession[]>;
type ProjectsBySubject = Record<string, Project[]>;

const STORAGE_KEY = "eduChat:sessions:v1";
const PROJECTS_STORAGE_KEY = "eduChat:projects:v1";
const TASKS_STORAGE_KEY = "eduChat:tasks:v1";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function loadSessions(): SessionsBySubject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionsBySubject) : {};
  } catch {
    return {};
  }
}

function saveSessions(data: SessionsBySubject) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadProjects(): ProjectsBySubject {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProjectsBySubject) : {};
  } catch {
    return {};
  }
}

function saveProjects(data: ProjectsBySubject) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveTasks(data: Task[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function weekdayOfNow() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function newWelcome(subjectName: string): Message {
  return {
    text: `Welcome to ${subjectName}! I am your personal AI assistant for this subject. Feel free to ask me anything related to ${subjectName}.`,
    isBot: true,
    timestamp: new Date().toISOString(),
  };
}

const findInitialSubject = (subjectId: string | undefined): Subject | null => {
  if (subjectId) {
    const normalizedId = subjectId.toLowerCase();
    if (normalizedId === 'math') {
      return subjects.find(s => s.id === 'mathematics') || null;
    }
    return subjects.find(s => s.id === normalizedId) || null;
  }
  return null;
};

const fetchYouTubeVideos = async (query: string, maxResults = 2): Promise<RelatedVideo[] | null> => {
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube API key is not configured. Video suggestions will be disabled.");
    return null;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=${maxResults}&safeSearch=strict`;

  try {
    const response = await axios.get(url);

    if (response.status === 403) {
      console.warn("YouTube API access forbidden. This may be due to an invalid API key or quota exceeded. Video suggestions will be disabled.");
      return null;
    }

    const videoResults: RelatedVideo[] = [];
    if (response.data.items && Array.isArray(response.data.items)) {
      response.data.items.forEach((item: any) => {
        if (item.id && item.id.videoId && item.snippet && item.snippet.thumbnails) {
          videoResults.push({
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          });
        }
      });
    }

    return videoResults.length > 0 ? videoResults : null;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 403) {
        console.warn("YouTube API access forbidden. This may be due to an invalid API key or quota limits. Video suggestions will be disabled.");
      } else if (error.response.status === 400) {
        console.warn("YouTube API request malformed. Video suggestions will be disabled.");
      } else {
        console.warn(`YouTube API error (${error.response.status}). Video suggestions will be disabled.`);
      }
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ENOTOUND') {
      console.warn("Network error while fetching YouTube videos. Video suggestions will be disabled.");
    } else {
      console.warn("Failed to fetch YouTube videos. Video suggestions will be disabled.");
    }
    return null;
  }
};

const subjectThematicInstructions: Record<string, Record<string, string>> = {
  english: {
    cricket: "Explain the concepts of plot, character, and theme using a cricket match as a metaphor. For example, a character's conflict is like a batsman's struggle against a bowler.",
    space: "Re-explain the literary devices in the poem using space exploration. The sun's light on Earth is like the first light on a newly discovered planet. The feeling of 'new beginnings' is like an astronaut starting a new mission.",
  },
  kannada: {
    space: "Translate and explain the passage using a space theme. The journey from village to city is like a journey from Earth to a new planet. The challenges and feelings of discovery are the same.",
  },
  social_science: {
    science: "Explain the Industrial Revolution by comparing it to a scientific experiment. The invention of the steam engine is a breakthrough discovery, and the social changes are the 'results' or 'side effects' of the experiment.",
    history: "Explain the historical context of a document as if it were a chapter in an ongoing epic saga. For example, the reasons for a war are the 'conflicts' or 'plot twists' in the story.",
  },
  science: {
    cricket: "Explain the physics of a cricket ball's trajectory (a parabola) and the force of the bat's impact. Use terms like 'kinetic energy' and 'momentum' in the context of a player's swing.",
    nature: "Explain a concept like a food chain using a rainforest ecosystem. Describe each animal's role and how they interact to maintain a 'natural balance'.",
  },
  history: {
    art: "Explain a historical period by looking at its art. For example, the Renaissance can be explained through the masterpieces of Leonardo da Vinci, linking the art to the scientific and cultural movements of the time.",
    space: "Reframe historical exploration (like the voyages of Columbus) as a form of space exploration. The new lands are 'new worlds' and the motivations are 'cosmic curiosity' and 'resource gathering'.",
  },
  physics: {
    space: "Explain concepts like gravity and orbital mechanics by using examples of planets orbiting stars and satellites orbiting Earth.",
  },
  chemistry: {
    history: "Explain chemical bonds by using an analogy of historical alliances or power struggles. Ionic bonds are like 'power transfers' between empires, and covalent bonds are like two countries 'sharing' resources to become stronger together.",
  },
  mathematics: {
    cricket: "Explain a math problem (e.g., probability or statistics) using a cricket game. 'What is the probability of a batsman scoring a century?' or 'How do you calculate a player's average run rate?'",
    space: "Explain a geometry problem by using the shapes of planets, orbits, and spaceships. Calculate the volume of a spherical planet or the distance between two celestial bodies.",
  },
};

const performanceInstructions: Record<string, string> = {
  weak: `
    - The student is weak. Act as a deep explainer.
    - Give detailed, step-by-step explanations, breaking concepts into small parts.
    - Use simple language, avoid jargon, and provide many examples/analogies.
    - Be patient and encouraging.
  `,
  average: `
    - The student is average. Give balanced explanations with moderate detail.
    - Use clear language, build on basics, and provide key examples.
  `,
  good: `
    - The student is good. Act as an expert.
    - Provide advanced insights and deeper analysis.
    - Use complex examples and encourage critical thinking.
    - Discuss nuances and real-world applications.
    - Challenge the student with thought-provoking questions.
  `,
};

const cleanTextForTTS = (text: string): string => {
  let cleaned = text
    .replace(/\*{1,2}/g, '')
    .replace(/#{1,6}/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    .replace(/[-_=+~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
};

// *** NEW HELPER FUNCTION FOR AGGRESSIVE SANITIZATION ***
const sanitizeContent = (text: string | null | undefined): string => {
  if (!text) return "";
  // Aggressively remove control characters, carriage returns, and excessive whitespace
  const result = text.trim()
    .replace(/[-\u001F\u007F-\u009F]/g, "") // Remove C0 and C1 control codes (common cause of 400 errors)
    .replace(/\r/g, "") // Remove carriage returns
    .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space
    .trim();
  console.log('Sanitized content length:', result.length); // Logging for debugging
  return result;
};
// ********************************************

const ChatInterface: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialContext = location.state?.context as string | undefined;
  const materialComment = location.state?.comment as string | undefined; // New: Extract comment from state

  const [userData, setUserData] = useState<any>(null);
  const [userLearningStyle, setUserLearningStyle] = useState<string>('read/write');
  const [hasReceivedInitialExplanation, setHasReceivedInitialExplanation] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(findInitialSubject(subjectId));
  const [newMessage, setNewMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const [recommendedMessages, setRecommendedMessages] = useState<string[]>([]);
  const [lastExplainedConcept, setLastExplainedConcept] = useState<string | null>(null);
  const [directAnswer, setDirectAnswer] = useState<string>('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [sessionsBySubject, setSessionsBySubject] = useState<SessionsBySubject>({});
  const [projectsBySubject, setProjectsBySubject] = useState<ProjectsBySubject>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const theme = useThemeStore();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState<number>(0);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [sidebarView, setSidebarView] = useState<'main' | 'account'>('main');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string>('none');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

// --- MODIFIED FUNCTION: INSTANT RESPONSE ---
const startTypingAnimation = (text: string, videoList?: RelatedVideo[], extractedMath?: string) => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    setLoading(false); // Stop loading indicator instantly

    const botMessage: Message = {
      text: text,
      isBot: true,
      timestamp: new Date().toISOString(),
      extractedMath: extractedMath || undefined,
      videoList: videoList || undefined, // Pass videos directly
    };

    setMessages(prev => {
        // This adds the final response instantly
        return [...prev, botMessage];
    });
    
    setRecommendedMessages(getRecommendations(text));
};
// ------------------------------------------

  React.useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPaused) {
        audioRef.current.play();
        setIsAudioPaused(false);
      } else {
        audioRef.current.pause();
        setIsAudioPaused(true);
      }
    }
  };

  const groupedByWeekday = Object.entries(sessionsBySubject).reduce((acc, [subjectId, sessions]) => {
    sessions.forEach(session => {
      if (!acc[session.weekday]) {
        acc[session.weekday] = [];
      }
      acc[session.weekday].push(session);
    });
    return acc;
  }, {} as Record<string, ChatSession[]>);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setUserLearningStyle(data?.learningStyle?.toLowerCase() || 'read/write');
        } else {
          console.error("Failed to fetch user data for chatbot sidebar.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  const handlePerformanceUpdate = () => {
    fetchUserData();
  };

  const getRecommendations = (botReply: string): string[] => {
    const lowerReply = botReply.toLowerCase();
    const recommendations: string[] = [];

    if (!hasReceivedInitialExplanation) {
      recommendations.push("Can you explain it with my theme?");
    }
    if (lowerReply.includes("like to start")) {
      recommendations.push("Start with the first problem", "Explain the concept first", "Give me a summary of the topic");
    }
    if (lowerReply.includes("how can i help") || lowerReply.includes("what can i help")) {
      recommendations.push("Explain this concept", "Help me with my homework", "Can you quiz me?");
    }
    if (lowerReply.includes("explain the concept")) {
      recommendations.push("Give me an example", "What's the next step?", "Provide a simpler explanation");
    }
    if (lowerReply.includes("what is") || lowerReply.includes("tell me about")) {
      recommendations.push("Give me a real-world example", "Can you simplify that?", "What's the history behind it?");
    }
    if (selectedSubject?.id === 'mathematics' && lowerReply.includes("problem")) {
      recommendations.push("Solve the first problem", "Show me a similar example", "Explain the formula again");
    }
    
    if (recommendations.length === 0) {
      if (lowerReply.includes('i don\'t get it') || lowerReply.includes('still not clear')) {
        recommendations.push("Try a different explanation");
      } else {
        recommendations.push("Tell me more", "Can you give me an example?", "Quiz me on this");
      }
    }

    return recommendations.slice(0, 3);
  };

  const handleRecommendationClick = (message: string) => {
    setNewMessage(message);
    handleSend({ preventDefault: () => {} } as FormEvent, message);
  };

  const handleBackToSubjectSelect = () => {
    navigate('/subjects');
  };

  const startNewChatSameSubject = () => {
    if (selectedSubject) {
      setMessages([newWelcome(selectedSubject.name)]);
      setCurrentSessionId(null);
      setChatContext(null);
      setRecommendedMessages([]);
      setHasReceivedInitialExplanation(false);
      setLastExplainedConcept(null);
      setDirectAnswer('');
    }
  };

  const beginRename = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.name);
  };

  const commitRename = (session: ChatSession) => {
    if (!selectedSubject || !renameValue.trim()) {
      setRenamingId(null);
      setRenameValue("");
      return;
    }

    const sessions = sessionsBySubject[selectedSubject.id] || [];
    const updatedSessions = sessions.map(s =>
      s.id === session.id ? { ...s, name: renameValue.trim() } : s
    );

    const newSessionsBySubject = {
      ...sessionsBySubject,
      [selectedSubject.id]: updatedSessions,
    };

    setSessionsBySubject(newSessionsBySubject);
    saveSessions(newSessionsBySubject);
    setRenamingId(null);
    setRenameValue("");
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setChatContext(null);
    setRecommendedMessages([]);
    setHasReceivedInitialExplanation(true);
    setLastExplainedConcept(null);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setNewMessage(transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        console.error("SpeechRecognition API not supported in this browser.");
      }
    }
  };

  const renderActiveToolPanel = () => {
    return (
      <div className="bg-black/70 p-4 rounded-t-xl border-b border-white/20">
        <p className="text-white text-sm">Tool panel placeholder for {activeTool}</p>
      </div>
    );
  };

  // Updated: First useEffect for initial context load with better placeholder
  useEffect(() => {
    if (initialContext && selectedSubject) {
      setLoading(true);
      const analyzingText = materialComment 
        ? `Analyzing your teacher's material on "${materialComment}"...` 
        : "Analyzing your teacher's material and instructions...";
      setMessages([
        newWelcome(selectedSubject.name),
        { text: analyzingText, isBot: true, timestamp: new Date().toISOString() }
      ]);
      setChatContext(initialContext);
      setRecommendedMessages([]);
      setHasReceivedInitialExplanation(false);
      setLastExplainedConcept(null);
    }
  }, [initialContext, selectedSubject, materialComment]);

  // Updated: Second useEffect for fetchAnalysis with fixes
  useEffect(() => {
    const fetchAnalysis = async () => {
      const sanitizedContext = sanitizeContent(chatContext); 
      if (sanitizedContext.length > 0 && userData && loading && selectedSubject) {
        try {
          const userInterests = userData?.interests?.toLowerCase() || 'general topics';
          const performanceLevel = userData?.performanceLevels?.[selectedSubject?.name || ''] || 'average';
          const userTheme = userData?.interests || 'none';

          // --- REDUCED PERFORMANCE INSTRUCTIONS (WEAK CONCISION) ---
          const performanceBasedInstruction: Record<string, string> = {
            weak: `
              - The student is weak. Act as a deep explainer.
              - **Be Concise.** Give clear, patient, step-by-step explanations. Break down concepts into the smallest parts.
              - Use simple language, avoid jargon, and provide **one or two** high-impact examples/analogies per step.
              - Do not ramble; prioritize clarity and brevity.
            `,
            average: `
              - The student is average. Give balanced explanations with moderate detail.
              - Use clear language, build on basics, and provide key examples.
            `,
            good: `
              - The student is good. Act as an expert.
              - Give advanced insights and deeper analysis.
              - Connect the topic to related concepts from other subjects (interdisciplinary).
              - Use complex, real-world examples and challenge the student with questions.
            `,
          };

          // --- REDUCED VISUAL INSTRUCTION FOR EDUCATIONAL VIDEOS (Limit 6) ---
          const baseStyleInstruction: Record<string, string> = {
            visual: `
              - VISUAL learner. Explain using descriptive language that creates mental images. Use visual analogies.
              - Suggest **6** specific YouTube search queries for related educational videos at the end.
              - IMPORTANT: Ensure query is highly specific and includes terms like 'tutorial', 'lesson', or 'for students'.
              - Format: Suggested YouTube search: "query here" (brief description).
            `,
            auditory: `
              - AUDITORY learner. Write in a clear, conversational tone. Use rhetorical questions, mnemonics, or rhymes.
              - Suggest reading the response aloud to reinforce the concept.
            `,
            kinesthetic: `
              - KINESTHETIC learner. Focus on action and practical application.
              - Provide concrete, step-by-step instructions or interactive tasks (Use verbs like "build," "try," "do").
              - Relate concepts to real-world physical activities.
            `,
          };

          const defaultInstruction = `
            - READ/WRITE learner. Provide clear, well-structured text.
            - Use numbered lists and bolded keywords. Summarize key definitions.
          `;

          const styleInstruction = baseStyleInstruction[userLearningStyle] || defaultInstruction;
          const performanceInstruction = performanceBasedInstruction[performanceLevel] || performanceBasedInstruction.average; // Fallback to average

          let systemInstructionText = `
            You are an expert AI tutor for the subject: ${selectedSubject.name}. Persona: friendly, patient teacher for a young student. Goal: make learning simple and engaging.
            CONSTRAINT: ONLY answer questions related to ${selectedSubject.name}. Refuse politely if off-topic.

            **INSTRUCTIONS FOR THIS STUDENT:**
            ${styleInstruction}
            
            **PERFORMANCE LEVEL:** ${performanceLevel}. Adjust difficulty accordingly.
            ${performanceInstruction}
            
            **PERSONALIZATION:** The student is interested in ${userInterests}. Use analogies/examples related to their interests when possible.
          `;

          // Define a default user prompt for initial explanation
          const defaultUserPrompt = `Based on the teacher's uploaded material and instructions, provide a clear, engaging summary and step-by-step guidance for the student. Tailor it to their learning style and performance level.`;
          const messageToSend = defaultUserPrompt;

          const isThematicRequest = defaultUserPrompt.toLowerCase().includes("explain it with my theme");
          const isFrustrationResponse = defaultUserPrompt.toLowerCase().includes("i don't get it") || defaultUserPrompt.toLowerCase().includes("still not clear");

          let isThematicResponse = false;
          let videoList: RelatedVideo[] | null = null;

          if (isThematicRequest && userTheme !== 'none' && lastExplainedConcept) {
            const thematicInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
            if (thematicInstruction) {
              isThematicResponse = true;
              systemInstructionText += `\n\n[Thematic Explanation Mode] The student wants a detailed explanation of '${lastExplainedConcept}' using a '${userTheme}' theme. Do not provide a generic answer. Focus on the thematic explanation.`;
              systemInstructionText += `\n\nFollow these specific instructions for the '${userTheme}' theme: ${thematicInstruction}`;
            }
          } else if (isFrustrationResponse && userTheme !== 'none' && lastExplainedConcept) {
            const thematicInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
            if (thematicInstruction) {
              isThematicResponse = true;
              systemInstructionText += `\n\n[Deeper Thematic Explanation Mode] The student is struggling to understand '${lastExplainedConcept}'. Your last response was not clear enough. Re-explain this concept from a different angle, using a deeper and more elaborate analogy based on the '${userTheme}' theme. Provide a detailed, step-by-step example.`;
              systemInstructionText += `\n\nFollow these specific instructions for the '${userTheme}' theme: ${thematicInstruction}`;
            }
          }

          const isMathOrPhysicsSubject = selectedSubject?.id === 'mathematics' || selectedSubject?.id === 'physics' || selectedSubject?.id === 'chemistry';

          if (isMathOrPhysicsSubject) {
              systemInstructionText += `
              \n\nFor problems involving calculations, use **chain-of-thought** reasoning. Show your work step-by-step using numbered lists and use LaTeX for all mathematical expressions. For example, use \\sqrt{} for square roots and \\frac{}{} for fractions.
              - Example:
              **1.** Find a common denominator.
              $\\frac{1}{2}$ becomes $\\frac{2}{4}$
              **2.** Add the fractions.
              $\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$
              **3.** Final Answer: **$\\frac{3}{4}$**
              `;
          }

          if (chatContext) {
            systemInstructionText += `\nAdditionally, the following context has been provided for this session: ${sanitizedContext}. Refer to this context when relevant.`;
          }

          const allMessagesForApi = messages.map((msg) => ({
            role: msg.isBot ? 'model' : 'user',
            parts: [{ text: sanitizeContent(msg.text) }], // Sanitize history message text
          }));
          
          // *** CRITICAL FIX: Aggressively filter history for valid role sequence ***
          let historyForApi: any[] = [];
          
          // 1. Filter out initial bot messages (like the welcome message)
          let startIndex = 0;
          if (allMessagesForApi.length > 0 && allMessagesForApi[0].role === 'model') {
            startIndex = 1;
          }

          // 2. Enforce Role Alternation
          let lastRole: string | null = null;
          for (let i = startIndex; i < allMessagesForApi.length; i++) {
            const currentMessage = allMessagesForApi[i];
            
            // Skip messages with empty content
            if (currentMessage.parts.length === 0 || sanitizeContent(currentMessage.parts[0].text).length === 0) {
                continue;
            }

            // Enforce alternating roles
            if (lastRole === currentMessage.role) {
              console.warn(`Skipping message due to non-alternating role: ${currentMessage.role}`);
              continue; 
            }

            historyForApi.push(currentMessage);
            lastRole = currentMessage.role;
          }
          // *******************************************************************

          const currentTurn = { role: 'user', parts: [{ text: sanitizeContent(messageToSend) }] };

          const mainResponse = await axios.post(
              GEMINI_API_URL,
              {
                // Now using the cleaned history
                contents: [...historyForApi, currentTurn],
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }, 
                // Content Object structure with fully sanitized string
                systemInstruction: { parts: [{ text: sanitizeContent(systemInstructionText) }] },
              },
              {
                headers: { 'Content-Type': 'application/json' },
                params: { key: GEMINI_API_KEY },
              }
          );
          
          let botReply = '';
          let extractedMath = '';

          botReply = mainResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || `Sorry, I couldn't process the material yet.`;
          if (isMathOrPhysicsSubject) {
            const extractMathPrompt = `Extract only the mathematical content from the following response. Include only fractions, numbers, equations, and calculations. Do not include any explanatory text, just the clean math content in plain text or LaTeX format. If there are no mathematical elements, return an empty string.

            Response to extract from:
            ${botReply}`;
            
            const extractResponse = await axios.post(
              GEMINI_API_URL,
              {
                contents: [{ role: 'user', parts: [{ text: sanitizeContent(extractMathPrompt) }] }], // Sanitize prompt
                generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
                // FIX B (Internal Call): Consistent structure
                systemInstruction: { parts: [{ text: sanitizeContent("You are an AI that extracts mathematical content from text. Return only the math, nothing else.") }] },
              },
              {
                headers: { 'Content-Type': 'application/json' },
                params: { key: GEMINI_API_KEY },
              }
            );
            extractedMath = extractResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          }

          let suggestedQueries: string[] = [];
          const lines = botReply.split('\n');
          let cleanedReplyLines: string[] = [];
          lines.forEach((line: string) => {
            if (line.trim().startsWith('Suggested YouTube search: ')) {
              const match = line.match(/Suggested YouTube search: "(.*?)"(?: \((.*?)\))?/);
              // *** LIMITING AND EXTRACTING QUERY ***
              if (match && match[1] && suggestedQueries.length < 6) {
                suggestedQueries.push(match[1]);
              }
            } else {
              cleanedReplyLines.push(line);
            }
          });
          botReply = cleanedReplyLines.join('\n').trim();

          videoList = null;
          if (userLearningStyle === 'visual' && suggestedQueries.length > 0) {
            // Fetch videos based on the extracted queries (Max 6)
            const videoPromises = suggestedQueries.map((query: string) => fetchYouTubeVideos(query, 1));
            const results = await Promise.all(videoPromises);
            // Final check: Filter out nulls and ensure max 6 videos total
            videoList = results.flatMap(list => list || []).filter(v => v.videoUrl).slice(0, 6);
          }

          // Updated: Remove the "Analyzing..." message before starting typing animation to avoid duplication
          setMessages(prev => prev.slice(0, -1)); // Remove analyzing placeholder

          startTypingAnimation(botReply, videoList || undefined, extractedMath || undefined);

          setLastExplainedConcept(defaultUserPrompt);
          setHasReceivedInitialExplanation(true);
          setChatContext(null);  // Clear after initial use to avoid re-triggering

        } catch (error: any) {
          console.error("Initial analysis failed:", error);
          // Fallback: Replace analyzing with error message
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 1 && updated[updated.length - 1].text.includes('Analyzing...')) {
              updated[updated.length - 1] = {
                text: "I analyzed the material, but let's clarify: What part would you like explained first? (e.g., the task or key concepts)",
                isBot: true,
                timestamp: new Date().toISOString()
              };
            }
            return updated;
          });
          setLoading(false);
        }
      }
    };

    if (chatContext) {  // Only trigger once on initial load
      fetchAnalysis();
    }
  }, [chatContext, userData, loading, selectedSubject, userLearningStyle]);  // Added dependencies

  useEffect(() => {
    fetchUserData();
    setSessionsBySubject(loadSessions());
    setProjectsBySubject(loadProjects());
    setTasks(loadTasks());

    const pollInterval = setInterval(() => {
      fetchUserData();
    }, 30000);

    return () => clearInterval(pollInterval);
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

  // handleSend function (updated maxOutputTokens)
  const handleSend = async (e: FormEvent, messageToSend?: string) => {
    e.preventDefault();
    const message = messageToSend || newMessage.trim();
    if (!message) return;

    // Sensitive content check (assuming it's defined elsewhere; truncated in original)
    const sensitiveKeywords = ['hate', 'violence']; // Placeholder
    const lowerMessage = message.toLowerCase();
    const containsSensitive = sensitiveKeywords.some(keyword => lowerMessage.includes(keyword));

    if (containsSensitive) {
      const refusalMessage: Message = {
        text: "I'm sorry, but I cannot provide responses to that type of content. Please ask questions related to the subject.",
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, refusalMessage]);
      setNewMessage('');
      return;
    }

    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsAudioPaused(false);
    }
    if (messages.length === 1) setIsSidebarCollapsed(true);

    const userMessage: Message = { text: message, isBot: false, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setRecommendedMessages([]);
    setDirectAnswer('');

    const userInterests = userData?.interests?.toLowerCase() || 'general topics';
    const performanceLevel = userData?.performanceLevels?.[selectedSubject.name] || 'average';
    const userTheme = userData?.interests || 'none';

    let systemInstructionText = `
      You are an expert AI tutor for the subject: ${selectedSubject.name}. Persona: friendly, patient teacher for a young student. Goal: make learning simple and engaging.
      CONSTRAINT: ONLY answer questions related to ${selectedSubject.name}. Refuse politely if off-topic.
    `;

    const isThematicRequest = message.toLowerCase().includes("explain it with my theme");
    const isFrustrationResponse = message.toLowerCase().includes("i don't get it") || message.toLowerCase().includes("still not clear");

    let isThematicResponse = false;
    let videoList: RelatedVideo[] | null = null;

    if (isThematicRequest && userTheme !== 'none' && lastExplainedConcept) {
      const thematicInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
      if (thematicInstruction) {
        isThematicResponse = true;
        systemInstructionText += `\n\n[Thematic Explanation Mode] The student wants a detailed explanation of '${lastExplainedConcept}' using a '${userTheme}' theme. Do not provide a generic answer. Focus on the thematic explanation.`;
        systemInstructionText += `\n\nFollow these specific instructions for the '${userTheme}' theme: ${thematicInstruction}`;
      }
    } else if (isFrustrationResponse && userTheme !== 'none' && lastExplainedConcept) {
      const thematicInstruction = subjectThematicInstructions[selectedSubject.id]?.[userTheme.toLowerCase()];
      if (thematicInstruction) {
        isThematicResponse = true;
        systemInstructionText += `\n\n[Deeper Thematic Explanation Mode] The student is struggling to understand '${lastExplainedConcept}'. Your last response was not clear enough. Re-explain this concept from a different angle, using a deeper and more elaborate analogy based on the '${userTheme}' theme. Provide a detailed, step-by-step example.`;
        systemInstructionText += `\n\nFollow these specific instructions for the '${userTheme}' theme: ${thematicInstruction}`;
      }
    } else {
      
      // --- REDUCED PERFORMANCE INSTRUCTIONS (WEAK CONCISION) ---
      const performanceBasedInstruction: Record<string, string> = {
        weak: `
          - The student is weak. Act as a deep explainer.
          - **Be Concise.** Give clear, patient, step-by-step explanations. Break down concepts into the smallest parts.
          - Use simple language, avoid jargon, and provide **one or two** high-impact examples/analogies per step.
          - Do not ramble; prioritize clarity and brevity.
        `,
        average: `
          - The student is average. Give balanced explanations with moderate detail.
          - Use clear language, build on basics, and provide key examples.
        `,
        good: `
          - The student is good. Act as an expert.
          - Give advanced insights and deeper analysis.
          - Connect the topic to related concepts from other subjects (interdisciplinary).
          - Use complex, real-world examples and challenge the student with questions.
        `,
      };

      // --- REDUCED VISUAL INSTRUCTION FOR EDUCATIONAL VIDEOS (Limit 6) ---
      const learningStyleInstructions: Record<string, string> = {
        visual: `
          - VISUAL learner. Explain using descriptive language that creates mental images. Use visual analogies.
          - Suggest **6** specific YouTube search queries for related educational videos at the end.
          - IMPORTANT: Ensure query is highly specific and includes terms like 'tutorial', 'lesson', or 'for students'.
          - Format: Suggested YouTube search: "query here" (brief description).
        `,
        auditory: `
          - AUDITORY learner. Write in a clear, conversational tone. Use rhetorical questions, mnemonics, or rhymes.
          - Suggest reading the response aloud to reinforce the concept.
        `,
        kinesthetic: `
          - KINESTHETIC learner. Focus on action and practical application.
          - Provide concrete, step-by-step instructions or interactive tasks (Use verbs like "build," "try," "do").
          - Relate concepts to real-world physical activities.
        `,
      };

      const defaultInstruction = `
        - READ/WRITE learner. Provide clear, well-structured text.
        - Use numbered lists and bolded keywords. Summarize key definitions.
      `;

      const styleInstruction = learningStyleInstructions[userLearningStyle] || defaultInstruction;
      const performanceInstruction = performanceBasedInstruction[performanceLevel] || performanceBasedInstruction.average; // Fallback to average

      systemInstructionText += `
        **INSTRUCTIONS FOR THIS STUDENT:**
        ${styleInstruction}
        
        **PERFORMANCE LEVEL:** ${performanceLevel}. Adjust difficulty accordingly.
        ${performanceInstruction}

        **PERSONALIZATION:** The student is interested in ${userInterests}. Use analogies/examples related to their interests when possible.
      `;
    }

    const isMathOrPhysicsSubject = selectedSubject?.id === 'mathematics' || selectedSubject?.id === 'physics' || selectedSubject?.id === 'chemistry';

    if (isMathOrPhysicsSubject) {
        systemInstructionText += `
        \n\nFor problems involving calculations, use **chain-of-thought** reasoning. Show your work step-by-step using numbered lists and use LaTeX for all mathematical expressions. For example, use \\sqrt{} for square roots and \\frac{}{} for fractions.
        - Example:
        **1.** Find a common denominator.
        $\\frac{1}{2}$ becomes $\\frac{2}{4}$
        **2.** Add the fractions.
        $\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$
        **3.** Final Answer: **$\\frac{3}{4}$**
        `;
    }

    if (chatContext) {
      systemInstructionText += `\nAdditionally, the following context has been provided for this session: ${sanitizeContent(chatContext)}. Refer to this context when relevant.`;
    }

    try {
      const allMessagesForApi = messages.map((msg) => ({
        role: msg.isBot ? 'model' : 'user',
        parts: [{ text: sanitizeContent(msg.text) }], // Sanitize history message text
      }));
      
      // *** CRITICAL FIX: Aggressively filter history for valid role sequence ***
      let historyForApi: any[] = [];
      
      // 1. Filter out initial bot messages (like the welcome message)
      let startIndex = 0;
      if (allMessagesForApi.length > 0 && allMessagesForApi[0].role === 'model') {
        startIndex = 1;
      }

      // 2. Enforce Role Alternation
      let lastRole: string | null = null;
      for (let i = startIndex; i < allMessagesForApi.length; i++) {
        const currentMessage = allMessagesForApi[i];
        
        // Skip messages with empty content
        if (currentMessage.parts.length === 0 || sanitizeContent(currentMessage.parts[0].text).length === 0) {
            continue;
        }

        // Enforce alternating roles
        if (lastRole === currentMessage.role) {
          console.warn(`Skipping message due to non-alternating role: ${currentMessage.role}`);
          continue; 
        }

        historyForApi.push(currentMessage);
        lastRole = currentMessage.role;
      }
      // *******************************************************************

      const currentTurn = { role: 'user', parts: [{ text: sanitizeContent(message) }] }; // Use the actual message here

      const mainResponse = await axios.post(
          GEMINI_API_URL,
          {
            // Now using the cleaned history
            contents: [...historyForApi, currentTurn],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }, // FIXED: Set to max
            // Content Object structure with fully sanitized string
            systemInstruction: { parts: [{ text: sanitizeContent(systemInstructionText) }] },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            params: { key: GEMINI_API_KEY },
          }
      );
      
      let botReply = '';
      let extractedMath = '';

      botReply = mainResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || `Sorry, I couldn't understand.`;
      if (isMathOrPhysicsSubject) {
        const extractMathPrompt = `Extract only the mathematical content from the following response. Include only fractions, numbers, equations, and calculations. Do not include any explanatory text, just the clean math content in plain text or LaTeX format. If there are no mathematical elements, return an empty string.

        Response to extract from:
        ${botReply}`;
        
        const extractResponse = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{ role: 'user', parts: [{ text: sanitizeContent(extractMathPrompt) }] }], // Sanitize prompt
            generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
            // FIX B (Internal Call): Consistent structure
            systemInstruction: { parts: [{ text: sanitizeContent("You are an AI that extracts mathematical content from text. Return only the math, nothing else.") }] },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            params: { key: GEMINI_API_KEY },
          }
        );
        extractedMath = extractResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }

      let suggestedQueries: string[] = [];
      const lines = botReply.split('\n');
      let cleanedReplyLines: string[] = [];
      lines.forEach((line: string) => {
        if (line.trim().startsWith('Suggested YouTube search: ')) {
          const match = line.match(/Suggested YouTube search: "(.*?)"(?: \((.*?)\))?/);
          // --- MODIFIED: Limit search queries to a maximum of 6 ---
          if (match && match[1] && suggestedQueries.length < 6) {
            suggestedQueries.push(match[1]);
          }
        } else {
          cleanedReplyLines.push(line);
        }
      });
      // *** FIX: OVERWRITE botReply with ONLY the clean content ***
      botReply = cleanedReplyLines.join('\n').trim();

      videoList = null;
      if (userLearningStyle === 'visual' && suggestedQueries.length > 0) {
        // Fetch videos based on the extracted queries (Max 6)
        const videoPromises = suggestedQueries.map((query: string) => fetchYouTubeVideos(query, 1));
        const results = await Promise.all(videoPromises);
        // Final check: Filter out nulls and ensure max 6 videos total
        videoList = results.flatMap(list => list || []).filter(v => v.videoUrl).slice(0, 6);
      }

      startTypingAnimation(botReply, videoList || undefined, extractedMath || undefined);

      setLastExplainedConcept(message);
      setHasReceivedInitialExplanation(true);

    } catch (error: any) { // Ensure error is typed as 'any' for Axios response access
      console.error("API call failed:", error);
      
      // >>> START: ROBUST ERROR LOGGING (Previously implemented) <<<
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        console.error("Gemini API Server Payload Error Details:", error.response.data);
      }
      // >>> END: ROBUST ERROR LOGGING <<<
      
      const errorMessage: Message = { text: "Sorry, something went wrong. Please try again.", isBot: true, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  // Adjusted paragraphRenderer for better spacing
  const paragraphRenderer = (props: any) => {
    const { node, children, ...rest } = props;
    // Apply a small bottom margin if it's not the very last element in its parent
    const isLastChild = node.parent && node.parent.children[node.parent.children.length - 1] === node;
    const className = `leading-relaxed ${isLastChild ? 'mb-0' : 'mb-2'}`; // Reduced spacing (Tailwind mb-2 = 0.5rem)

    return <p className={className} {...rest}>{children}</p>;
  };

  const mathRenderer = (props: any) => {
    const { children } = props;
    const text = children as string;

    if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
      const math = text.slice(1, -1);
      return <InlineMath math={math} />;
    }

    if (text.startsWith('$$') && text.endsWith('$$') && text.length > 4) {
      const math = text.slice(2, -2);
      return <BlockMath math={math} />;
    }

    return <span>{text}</span>;
  };

  const codeRenderer = (props: any) => {
    const { children, className } = props;
    const text = children as string;

    if (className === 'language-math' || text.includes('\\') || text.includes('$')) {
      try {
        return <BlockMath math={text} />;
      } catch (error) {
        return <code className={className}>{text}</code>;
      }
    }

    return <code className={className}>{text}</code>;
  };

  const categories = Array.from(new Set(subjects.map(s => s.category)));

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: theme.backgrounds && theme.backgrounds.length > 0 ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
      
      
        <div className="flex flex-1 overflow-hidden relative z-10">
          <AnimatePresence>
            {messages.length <= 1 && selectedSubject && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 right-0 z-20 p-6 text-center text-white backdrop-blur-md bg-black/70 shadow-lg border-b border-white/20 transition-all duration-300 ${isSidebarCollapsed ? 'left-[100px]' : 'left-[250px]'}`}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-1">
                  Welcome to the {selectedSubject.name} Chatbot!
                </h2>
                <p className="text-lg text-gray-200">
                  I'm here to help you understand and learn about this subject. Feel free to ask me anything.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <Sidebar
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            sessionsBySubject={sessionsBySubject}
            setSessionsBySubject={setSessionsBySubject}
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
            loadSession={loadSession}
            startNewChatSameSubject={startNewChatSameSubject}
            userData={userData}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            onBackButtonClick={handleBackToSubjectSelect}
          />

          <div className={`flex flex-col flex-1 ${isSidebarCollapsed ? 'ml-[100px]' : 'ml-[250px]'} transition-all duration-300`}>
            {/* The main chat area is now pushed down by a top padding to accommodate the fixed header */}
            <motion.div
              className="flex-1 overflow-y-auto pt-[150px] pb-40 px-8 md:px-16 space-y-2"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex w-full ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-7xl ${
                      msg.isBot
                        ? 'text-gray-200 bg-black/70 p-4 rounded-xl'
                        : 'bg-blue-700 text-white p-4 rounded-xl'
                    }`}
                  >
                    <ReactMarkdown
                      className="text-lg leading-relaxed whitespace-pre-wrap text-left"
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: paragraphRenderer, // Using the adjusted renderer
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                    {loading && msg.isBot && idx === messages.length - 1 && (
                      <span
                        className="inline-block w-2 h-6 bg-white animate-pulse"
                        style={{ animation: 'blink 1s infinite' }}
                      />
                    )}

                    {msg.attachmentUrl && (
                      msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img src={msg.attachmentUrl} alt="Generated image" className="mt-4 max-w-full rounded-lg" />
                      ) : (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:underline"
                        >
                          <Paperclip size={16} />
                          View Attached File
                        </a>
                      )
                    )}
                    {msg.videoList && msg.videoList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-500/50">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Related Videos:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {msg.videoList.map((video, videoIdx) => {
                            const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
                            return (
                              <div
                                key={videoIdx}
                                className="bg-black/50 rounded-lg overflow-hidden"
                              >
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full aspect-square"
                                ></iframe>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-black/70 border border-white/20 p-3 rounded-2xl shadow-sm text-white flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              
            </motion.div>
            
            <AnimatePresence mode="wait">
              {!loading && (
                <motion.div
                  key="input-form"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center p-6 bg-transparent"
                  style={{
                    marginLeft: isSidebarCollapsed ? '100px' : '250px',
                    transition: 'margin-left 0.3s ease-in-out'
                  }}
                >
                  <AnimatePresence>
                    {activeTool !== "none" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full max-w-5xl"
                      >
                        {renderActiveToolPanel()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="w-full max-w-5xl flex gap-2 mb-4 overflow-x-auto">
                    <AnimatePresence>
                      {recommendedMessages.map((rec, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          onClick={() => handleRecommendationClick(rec)}
                          className="flex-shrink-0 bg-white/20 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors"
                        >
                          {rec}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="w-full max-w-5xl bg-black/70 rounded-3xl p-4 flex flex-col focus-within:ring-2 focus-within:ring-blue-500/80 transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                          }
                        }}
                        className="flex-1 w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                        placeholder="Ask me anything..."
                        disabled={loading}
                      />
                      {userLearningStyle === 'auditory' && audioRef.current && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleAudio}
                          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isAudioPaused ? "Resume audio" : "Pause audio"}
                        >
                          {isAudioPaused ? <Play size={18} /> : <Pause size={18} />}
                        </motion.button>
                      )}
                      {newMessage.trim() && (
                        <button
                          type="submit"
                          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send"
                        >
                          <Send size={18} />
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={handleAttachmentClick}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Attach file"
                        >
                          <Plus size={24} />
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                          title="Tools (Display Only)"
                        >
                          <SlidersHorizontal size={22} />
                          <span className="font-medium text-sm">Tools</span>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleVoiceToggle}
                          className="text-gray-400 hover:text-white transition-colors relative h-10 w-10 flex items-center justify-center"
                          title="Use microphone"
                        >
                          <AnimatePresence>
                            {isRecording && (
                              <motion.div
                                key="mic-glowing-animation"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: [1, 1.1, 1] }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{
                                  scale: {
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }
                                }}
                                className="absolute inset-0"
                              >
                                <div className="absolute inset-0 animate-spin [animation-duration:3s]">
                                  <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,#4f46e5_0%,#a855f7_50%,#4f46e5_100%)] blur-xl opacity-80"></div>
                                </div>
                                <div className="absolute inset-1.5 bg-gray-900 rounded-full"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Mic size={24} className="text-purple-300" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {!isRecording && <Mic size={24} />}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      
    </div>
  );
};

export default ChatInterface; 
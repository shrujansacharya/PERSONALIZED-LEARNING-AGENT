// Chatbot.tsx - UPDATED (Welcome message hides on send)
import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from '../store/theme';
import Sidebar from "./SidebarChatbot";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatLogic } from "../hooks/useChatLogic";
import { findInitialSubject, loadSessions, generatePDF } from "../utils/chatUtils";
import type { Subject, UserData, SessionsBySubject, ChatSession } from "../types";
import { Menu, ArrowLeft } from "lucide-react"; 

const ChatInterface: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialContext = location.state?.context as string | undefined;
  const materialComment = location.state?.comment as string | undefined;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(findInitialSubject(subjectId));
  const [newMessage, setNewMessage] = useState<string>('');
  const [sessionsBySubject, setSessionsBySubject] = useState<SessionsBySubject>(loadSessions());
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const [showWelcome, setShowWelcome] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatLogic = useChatLogic({
    selectedSubject,
    userData,
    setUserData,
    initialContext,
    materialComment,
    sessionsBySubject,
    setSessionsBySubject,
    newMessage,
    setNewMessage,
  });

  const {
    state: { messages, loading, recommendedMessages, hasReceivedInitialExplanation },
    userLearningStyle,
    currentBackgroundIndex,
    isRecording,
    audioRef,
    handleVoiceToggle,
    handleRecommendationClick,
    loadSession,
    startNewChatSameSubject,
    handleSend,
    fetchUserData,
    activeTool,
    setActiveTool,
    renderPhET,
    currentTheme,
    setCurrentTheme,
    isOffline,
    isSpeaking,
    isSpeechPaused,
    toggleSpeech,
  } = chatLogic;

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData?.interests) {
      const interestsArray = userData.interests.split(',').map(i => i.trim());
      setUserInterests(interestsArray);
      if (interestsArray.length > 0) {
        setCurrentTheme(interestsArray[0]);
      }
    }
  }, [userData, setCurrentTheme]);

  // MODIFICATION: The 10-second timer useEffect has been REMOVED.

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("File selected:", file.name);
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();
  const handleBackToSubjectSelect = () => navigate('/subjects');
  const theme = useThemeStore();

  const topNavButtonClass = "p-2 bg-black/50 rounded-lg text-white backdrop-blur-md hover:bg-white/20 transition-colors";

  // MODIFICATION: Created a new function to wrap handleSend
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hide the welcome message if it's currently shown
    if (showWelcome) {
      setShowWelcome(false);
    }
    
    // Call the original send function from the hook
    handleSend(e);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: theme.backgrounds?.[currentBackgroundIndex] ? `url(${theme.backgrounds[currentBackgroundIndex]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30"
          />
        )}
      </AnimatePresence>

      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        <button
          onClick={handleBackToSubjectSelect}
          className={topNavButtonClass}
          aria-label="Back to subjects"
          title="Back to subjects"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={topNavButtonClass}
          aria-label="Open menu"
          title="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <Sidebar
        selectedSubject={selectedSubject}
        sessionsBySubject={sessionsBySubject}
        setSessionsBySubject={setSessionsBySubject}
        loadSession={loadSession}
        startNewChatSameSubject={startNewChatSameSubject}
        userData={userData}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onBackButtonClick={() => {
          handleBackToSubjectSelect();
          setIsSidebarOpen(false);
        }}
      />

      <div className="flex flex-1 overflow-hidden relative z-10 h-screen">
        
        <div className={`relative flex flex-col flex-1 transition-all duration-300 pt-20`}>
          
          <ChatMessages
            messages={messages}
            loading={loading}
            recommendedMessages={recommendedMessages}
            onRecommendationClick={handleRecommendationClick}
            selectedSubject={selectedSubject}
            isSidebarCollapsed={!isSidebarOpen}
            theme={theme}
            currentBackgroundIndex={currentBackgroundIndex}
            userLearningStyle={userLearningStyle}
            audioRef={audioRef}
            hasReceivedInitialExplanation={hasReceivedInitialExplanation}
            renderPhET={renderPhET}
            currentTheme={currentTheme}
          />
          <AnimatePresence>
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className={`absolute bottom-0 z-20 flex flex-col items-center left-0 right-0 px-4 pb-4 md:px-6 md:pb-6 bg-transparent`}
            >
              <div className="w-full max-w-6xl mx-auto mb-4">
                <div className="flex gap-2 overflow-x-auto">
                  <AnimatePresence>
                    {!loading && recommendedMessages.map((rec, index) => (
                      <motion.button
                        key={rec}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => handleRecommendationClick(rec)}
                        className="flex-shrink-0 bg-white/20 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors"
                      >
                        {rec}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                loading={loading}
                userLearningStyle={userLearningStyle}
                onAttachmentClick={handleAttachmentClick}
                onFileChange={handleFileChange}
                onVoiceToggle={handleVoiceToggle}
                isRecording={isRecording}
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                // MODIFICATION: Pass the new wrapper function to onSubmit
                onSubmit={handleSubmitMessage}
                inputRef={inputRef}
                fileInputRef={fileInputRef}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                userInterests={userInterests}
                isSpeaking={isSpeaking}
                isSpeechPaused={isSpeechPaused}
                onToggleSpeech={toggleSpeech}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {isOffline && (
        <div className="fixed top-20 left-4 bg-red-600 text-white p-2 rounded z-30">
          Offline Mode
        </div>
      )}
      {messages.length > 1 && (
        <button
          onClick={() => {
            const lastBotMessage = messages.slice().reverse().find(m => m.isBot);
            if (lastBotMessage) {
              generatePDF(lastBotMessage.text, lastBotMessage.extractedMath);
            }
          }}
          className="fixed top-4 right-4 bg-blue-600 text-white p-2 rounded z-30"
          title="Download as PDF"
        >
          📄 PDF
        </button>
      )}
      <AnimatePresence>
        {showWelcome && messages.length <= 1 && selectedSubject && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-20 flex justify-center transition-all duration-300 pt-16 px-4`}
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-1 welcome-gradient-text welcome-text-glow">
                Welcome to the {selectedSubject.name} Chatbot!
              </h2>
              <p className="text-lg text-gray-200 welcome-text-glow">
                I'm here to help you learn. Feel free to ask me anything.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
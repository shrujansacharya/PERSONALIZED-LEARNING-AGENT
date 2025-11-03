// Chatbot.tsx - Fixed input box visibility during loading
import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from '../store/theme';
import Sidebar from "./Sidebar";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatLogic } from "../hooks/useChatLogic";
import { findInitialSubject, loadSessions, generatePDF } from "../utils/chatUtils";
import type { Subject, UserData, SessionsBySubject, ChatSession } from "../types";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("File selected:", file.name);
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();
  const handleBackToSubjectSelect = () => navigate('/subjects');
  const theme = useThemeStore();

  const sidebarOffset = isSidebarCollapsed ? '100px' : '250px';

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
      <div className="flex flex-1 overflow-hidden relative z-10 h-screen">
        <Sidebar
          selectedSubject={selectedSubject}
          sessionsBySubject={sessionsBySubject}
          loadSession={loadSession}
          startNewChatSameSubject={startNewChatSameSubject}
          userData={userData}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          onBackButtonClick={handleBackToSubjectSelect}
        />
        <div className={`relative flex flex-col flex-1 ml-[${sidebarOffset}] transition-all duration-300 pt-20`}>
          <ChatMessages
            messages={messages}
            loading={loading}
            recommendedMessages={recommendedMessages}
            onRecommendationClick={handleRecommendationClick}
            selectedSubject={selectedSubject}
            isSidebarCollapsed={isSidebarCollapsed}
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
              className={`absolute bottom-0 z-20 flex flex-col items-center left-0 right-0 px-6 pb-6 bg-transparent`}
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
                onSubmit={handleSend}
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
        <div className="fixed top-4 left-4 bg-red-600 text-white p-2 rounded z-30">
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
        {messages.length <= 1 && selectedSubject && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-20 flex justify-center transition-all duration-300`}
          >
            <div className="p-6 text-center text-white backdrop-blur-md bg-black/70 shadow-lg border-b border-white/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-1">Welcome to the {selectedSubject.name} Chatbot!</h2>
              <p className="text-lg text-gray-200">I'm here to help you learn. Feel free to ask me anything.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
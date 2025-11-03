// ChatInput.tsx - Removed the focus ring
import React, { FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, SlidersHorizontal, Mic, Pause, Play } from 'lucide-react';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  loading: boolean;
  userLearningStyle: string;
  onAttachmentClick: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVoiceToggle: () => void;
  isRecording: boolean;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onSubmit: (e: FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  userInterests: string[];
  isSpeaking: boolean;
  isSpeechPaused: boolean;
  onToggleSpeech: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  loading,
  userLearningStyle,
  onAttachmentClick,
  onFileChange,
  onVoiceToggle,
  isRecording,
  activeTool,
  setActiveTool,
  onSubmit,
  inputRef,
  fileInputRef,
  currentTheme,
  setCurrentTheme,
  userInterests,
  isSpeaking,
  isSpeechPaused,
  onToggleSpeech,
}) => {
  const toggleTheme = () => {
    const index = userInterests.indexOf(currentTheme);
    setCurrentTheme(userInterests[(index + 1) % userInterests.length] || 'default');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-6xl bg-black rounded-3xl p-4 flex flex-col transition-shadow duration-300">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
          placeholder="Ask me anything..."
          disabled={loading}
        />
        
        {userLearningStyle === 'auditory' && isSpeaking && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSpeech}
            className="bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-gray-500 transition-colors"
            title={isSpeechPaused ? "Resume audio" : "Pause audio"}
          >
            {isSpeechPaused ? <Play size={18} /> : <Pause size={18} />}
          </motion.button>
        )}

        {newMessage.trim() && !loading && (
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-blue-500 transition-colors"
            title="Send"
          >
            <Send size={18} />
          </button>
        )}
      </div>
      
      <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: "none" }} />
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onAttachmentClick} className="text-gray-400 hover:text-white transition-colors" title="Attach file">
            <Plus size={24} />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'none' ? 'tools' : 'none')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            title="Tools"
          >
            <SlidersHorizontal size={22} />
            <span className="font-medium text-sm">Tools</span>
          </button>
          <button type="button" onClick={toggleTheme} className="text-gray-400 hover:text-white transition-colors" title="Toggle Theme">
            🎭 {currentTheme}
          </button>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={onVoiceToggle}
            className="text-gray-400 hover:text-white transition-colors relative h-10 w-10 flex items-center justify-center"
            title="Use microphone"
            disabled={loading}
          >
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  key="mic-glowing-animation"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.1, 1] }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
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
  );
};
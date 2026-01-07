// ChatInput.tsx - UPDATED: Further enhanced animations with smoother transitions and advanced effects
import React, { FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  loading: boolean;
  userLearningStyle: string;
  onVoiceToggle: () => void;
  isRecording: boolean;
  onSubmit: (e: FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isSpeaking: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  loading,
  userLearningStyle,
  onVoiceToggle,
  isRecording,
  onSubmit,
  inputRef,
  isSpeaking,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
    }
  };

  return (
    <form 
      onSubmit={onSubmit} 
      className="mx-auto max-w-7xl bg-black rounded-3xl p-4 flex items-center gap-4 animated-input-glow"
    >
      <input
        ref={inputRef}
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg w-[1000px] max-w-full"
        placeholder="How can Learny help?"
        disabled={loading}
      />
      
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onVoiceToggle}
          className="text-gray-400 hover:text-white transition-colors relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden group"
          title="Use microphone"
          disabled={loading}
        >
          <AnimatePresence>
            {isRecording ? (
              <motion.div
                key="voice-advanced-animation"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.18, 1],
                }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ 
                  scale: { duration: 2.2, repeat: Infinity, ease: [0.33, 0, 0.67, 0] },
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 shadow-2xl shadow-cyan-500/40"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Advanced multi-layer depth with gradients */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 opacity-95 shadow-inner-lg"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-gray-900/90 to-black/50 flex items-center justify-center border-2 border-cyan-400/30 shadow-md shadow-cyan-400/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 4, repeat: Infinity, ease: "linear", delay: 1 }
                    }}
                  >
                    <Mic size={14} className="text-white drop-shadow-lg" />
                  </motion.div>
                </div>
                {/* Advanced outer glow with phased rings */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/40 shadow-xl shadow-cyan-400/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ 
                    duration: 3.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.7
                  }}
                  className="absolute inset-0 rounded-full border border-blue-400/30 opacity-80 shadow-lg shadow-blue-400/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.2
                  }}
                  className="absolute inset-0 rounded-full border border-indigo-400/20 opacity-60"
                />
                {/* Subtle particle-like glow */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.3)_0%,transparent_50%)] animate-pulse"></div>
              </motion.div>
            ) : (
              <motion.div
                key="mic-icon"
                initial={{ scale: 0.7, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Mic size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {(loading || (newMessage.trim() && !loading)) && (
          <button
            type={loading ? "button" : "submit"}
            disabled={loading}
            className={`relative rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-500 overflow-hidden group ${
              loading 
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-600/30' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
            }`}
            title={loading ? "Processing..." : "Send"}
          >
            {loading ? (
              <div className="w-7 h-7 relative">
                <motion.div
                  animate={{ 
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 1.4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Advanced spinner with multi-phase rotation and depth */}
                  <motion.div
                    animate={{ 
                      scale: [0.85, 1.15, 0.85],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.8, 
                      repeat: Infinity, 
                      ease: [0.33, 0, 0.67, 0] 
                    }}
                    className="absolute inset-0 w-6 h-6 border-2 border-blue-400/50 border-t-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/50"
                  />
                  {/* Counter-rotating inner orb */}
                  <motion.div
                    animate={{ 
                      rotate: -360,
                      scale: [0.95, 1.08, 0.95]
                    }}
                    transition={{ 
                      duration: 1.8, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: 0.3
                    }}
                    className="absolute inset-1.5 w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-inner-lg shadow-indigo-400/60"
                  >
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                  </motion.div>
                  {/* Enhanced pulse core with glow */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.25, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.6
                    }}
                    className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-white to-blue-200 rounded-full mx-auto my-auto shadow-md shadow-blue-300/40"
                  />
                  {/* Outer aura */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 rounded-full border border-blue-400/20 opacity-70 shadow-2xl shadow-blue-400/20"
                  />
                </motion.div>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Send size={18} />
              </motion.div>
            )}
          </button>
        )}
      </div>
    </form>
  );
};
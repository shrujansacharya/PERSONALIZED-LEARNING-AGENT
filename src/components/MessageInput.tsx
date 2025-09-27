import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface RecommendedMessage {
  id: string;
  text: string;
}

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  loading: boolean;
  recommendedMessages: RecommendedMessage[];
  onSelectRecommended: (message: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  onSendMessage,
  loading,
  recommendedMessages,
  onSelectRecommended,
  isListening,
  onToggleListening,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-white/20 bg-black/50">
      {recommendedMessages.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Recommended:</p>
          <div className="flex flex-wrap gap-2">
            {recommendedMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => onSelectRecommended(msg.text)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-full transition"
              >
                {msg.text}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 p-3 bg-gray-800 text-white rounded-lg resize-none min-h-[40px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          disabled={loading}
        />
        <button
          onClick={onToggleListening}
          className={`p-3 rounded-lg transition ${
            isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          disabled={loading}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

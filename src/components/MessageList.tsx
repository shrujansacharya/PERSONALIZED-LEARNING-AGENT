import React from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onScrollToBottom?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, onScrollToBottom }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-[70%] p-3 rounded-lg whitespace-pre-wrap ${
            message.role === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-gray-800 text-white self-start'
          }`}
        >
          {message.content}
        </div>
      ))}
      {loading && (
        <div className="text-gray-400 italic text-center">Loading...</div>
      )}
      {/* Optional: Add a button or auto-scroll to bottom */}
      {onScrollToBottom && (
        <button
          onClick={onScrollToBottom}
          className="mt-2 text-sm text-blue-400 hover:underline"
        >
          Scroll to bottom
        </button>
      )}
    </div>
  );
};

export default MessageList;

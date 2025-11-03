// ChatMessages.tsx - Centered chat container (max-w-6xl mx-auto) for all responses in central area
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, Paperclip, Play, Pause } from 'lucide-react';
import 'katex/dist/katex.min.css';
import type { Message, RelatedVideo, Subject } from '../types';
import { paragraphRenderer, mathRenderer, codeRenderer, headingRenderer } from '../utils/chatUtils';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  recommendedMessages: string[];
  onRecommendationClick: (msg: string) => void;
  selectedSubject?: Subject | null;
  isSidebarCollapsed: boolean;
  theme: any;
  currentBackgroundIndex: number;
  userLearningStyle: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  hasReceivedInitialExplanation: boolean;
  renderPhET?: (url: string) => JSX.Element;
  currentTheme?: string;
}

const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert" className="p-4 bg-red-500 text-white rounded">
    Something went wrong rendering this message: {error.message}.
  </div>
);

export const ChatMessages: React.FC<ChatMessagesProps> = (props) => {
  const { messages, loading, recommendedMessages, onRecommendationClick, selectedSubject, isSidebarCollapsed, theme, currentBackgroundIndex, hasReceivedInitialExplanation, renderPhET } = props;

  const messagesContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable messages container
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for the bottom anchor (stable position)

  // Enhanced auto-scroll: Always scroll to bottom after new content renders, keeping input stable/visible
  // Trigger on messages change, loading end, or any prop that affects content height (e.g., videos)
  useEffect(() => {
    const timeoutId = setTimeout(() => { // Slight delay to allow DOM/iframes to fully render (videos can take time)
      const container = messagesContainerRef.current;
      if (container) {
        // Scroll to bottom instantly for snappy UX (ensures input is in view without overlap)
        container.scrollTop = container.scrollHeight - container.clientHeight;
        
        // Alternative: Smooth scroll to anchor (uncomment for animated feel, but may jitter with videos)
        // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }
    }, 100); // 100ms delay for heavy content like embeds

    return () => clearTimeout(timeoutId); // Cleanup
  }, [messages, loading]); // Re-run on new messages or loading complete

  const loadingText = hasReceivedInitialExplanation ? "Thinking..." : "Analyzing your material...";

  return (
    <div
      ref={messagesContainerRef}
      className="w-full max-w-6xl mx-auto flex-1 overflow-y-auto pb-32 px-6 space-y-4 h-full" // Added max-w-6xl mx-auto for central chat area
    >
      {messages.map((msg, idx) => (
        <motion.div
          key={msg.id || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex w-full ${msg.isBot ? "justify-center" : "justify-end"}`} // Bot: Center, User: Right-align within central container
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className={msg.isBot 
              ? 'max-w-full w-full text-gray-200 bg-black/70 p-4 rounded-xl'  // Bot: Full-width within container
              : 'max-w-md min-w-0 w-fit text-white bg-blue-700 px-3 py-2 rounded-xl' // User: Content-fitted, right-aligned in central area
            }>
              <ReactMarkdown
                className="text-base leading-relaxed whitespace-pre-wrap text-left" // Slightly smaller text/base for compact user msgs
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: paragraphRenderer,
                  math: mathRenderer,
                  code: codeRenderer,
                  h1: headingRenderer,
                  h2: headingRenderer,
                  h3: headingRenderer,
                  h4: headingRenderer,
                  h5: headingRenderer,
                  h6: headingRenderer,
                }}
              >
                {msg.text}
              </ReactMarkdown>
              
              {msg.videoList && msg.videoList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-500/50">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Related Videos:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {msg.videoList.map((video, videoIdx) => {
                      const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
                      return (
                        <div key={videoIdx} className="bg-black/50 rounded-lg overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full aspect-video"
                            loading="lazy" // Lazy-load to reduce initial render delay
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {renderPhET && msg.text.includes('PhET') && renderPhET('https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html')}
            </div>
          </ErrorBoundary>
        </motion.div>
      ))}
      {loading && (
        <div className="flex justify-center">
          <div className="bg-black/70 border border-white/20 p-3 rounded-2xl shadow-sm text-white flex items-center gap-2 w-full max-w-full">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm">{loadingText}</span>
          </div>
        </div>
      )}
      {/* Stable anchor at absolute bottom - input floats above this via absolute positioning */}
      <div ref={messagesEndRef} className="h-0" />
    </div>
  );
};
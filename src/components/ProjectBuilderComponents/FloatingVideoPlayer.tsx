
import React from 'react';
import { motion } from 'framer-motion';
import { Video, X, Plus, Minus } from 'lucide-react';
import { YouTubeVideo } from './types';
import { YouTubeService } from '../../lib/YouTubeService';

interface FloatingVideoPlayerProps {
  currentPlayingVideo: YouTubeVideo | null;
  setCurrentPlayingVideo: (video: YouTubeVideo | null) => void;
  isVideoMinimized: boolean;
  setIsVideoMinimized: (minimized: boolean) => void;
  videoPosition: { x: number; y: number };
  setVideoPosition: (position: { x: number; y: number }) => void;
  videoSize: { width: number; height: number };
  setVideoSize: (size: { width: number; height: number }) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;
  resizeStart: { x: number; y: number; width: number; height: number };
  setResizeStart: (start: { x: number; y: number; width: number; height: number }) => void;
  youtubeService: YouTubeService;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  handleResizeStart: (e: React.MouseEvent) => void;
  setVideoSizePreset: (width: number, height: number) => void;
}

const FloatingVideoPlayer: React.FC<FloatingVideoPlayerProps> = ({
  currentPlayingVideo,
  setCurrentPlayingVideo,
  isVideoMinimized,
  setIsVideoMinimized,
  videoPosition,
  setVideoPosition,
  videoSize,
  setVideoSize,
  isDragging,
  setIsDragging,
  isResizing,
  setIsResizing,
  dragOffset,
  setDragOffset,
  resizeStart,
  setResizeStart,
  youtubeService,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleResizeStart,
  setVideoSizePreset,
}) => {
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    currentPlayingVideo && (
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{
          left: videoPosition.x,
          top: videoPosition.y,
          width: isVideoMinimized ? '320px' : `${videoSize.width}px`,
          height: isVideoMinimized ? 'auto' : `${videoSize.height}px`,
          cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
        }}
      >
        {/* Header with drag handle and controls */}
        <div
          className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Video className="text-red-500" size={16} />
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
              {currentPlayingVideo.snippet?.title || 'Video Title'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Size Presets */}
            <div className="flex gap-1 mr-2">
              <button
                onClick={() => setVideoSizePreset(400, 250)}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                title="Small (400x250)"
              >
                S
              </button>
              <button
                onClick={() => setVideoSizePreset(600, 350)}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                title="Medium (600x350)"
              >
                M
              </button>
              <button
                onClick={() => setVideoSizePreset(800, 450)}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                title="Large (800x450)"
              >
                L
              </button>
            </div>

            <button
              onClick={() => setIsVideoMinimized(!isVideoMinimized)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              title={isVideoMinimized ? 'Maximize' : 'Minimize'}
            >
              {isVideoMinimized ? <Plus size={14} /> : <Minus size={14} />}
            </button>
            <button
              onClick={() => {
                setCurrentPlayingVideo(null);
                setIsVideoMinimized(false);
                setVideoSize({ width: 400, height: 250 });
              }}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        {!isVideoMinimized && (
          <div className="relative">
            <iframe
              width="100%"
              height={videoSize.height - 50}
              src={youtubeService.getEmbedUrl(currentPlayingVideo.id?.videoId)}
              title={currentPlayingVideo.snippet?.title || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-b-lg"
            />

            {/* Resize Handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gray-300 dark:bg-gray-600 rounded-tl-lg flex items-end justify-start"
              onMouseDown={handleResizeStart}
            >
              <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-tl-sm"></div>
            </div>
          </div>
        )}

        {/* Minimized state info */}
        {isVideoMinimized && (
          <div className="p-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {currentPlayingVideo.snippet?.title || 'Video Title'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click + to expand
            </p>
          </div>
        )}
      </div>
    )
  );
};

export default FloatingVideoPlayer;

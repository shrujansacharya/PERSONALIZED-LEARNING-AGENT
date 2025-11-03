
import React from 'react';
import { motion } from 'framer-motion';
import { Video, X, Search, Play } from 'lucide-react';
import { YouTubeVideo, ProjectTemplate } from './types';
import { YouTubeService } from '../../lib/YouTubeService';

interface VideoModalProps {
  showVideoModal: boolean;
  setShowVideoModal: (show: boolean) => void;
  selectedProject: ProjectTemplate | null;
  videos: YouTubeVideo[];
  videosLoading: boolean;
  videoSearchQuery: string;
  setVideoSearchQuery: (query: string) => void;
  handleVideoSearch: (query: string) => Promise<void>;
  currentPlayingVideo: YouTubeVideo | null;
  setCurrentPlayingVideo: (video: YouTubeVideo | null) => void;
  setIsVideoMinimized: (minimized: boolean) => void;
  setToast: (toast: { message: string; type: 'success' | 'error'; duration?: number } | null) => void;
  youtubeService: YouTubeService;
}

const VideoModal: React.FC<VideoModalProps> = ({
  showVideoModal,
  setShowVideoModal,
  selectedProject,
  videos,
  videosLoading,
  videoSearchQuery,
  setVideoSearchQuery,
  handleVideoSearch,
  currentPlayingVideo,
  setCurrentPlayingVideo,
  setIsVideoMinimized,
  setToast,
  youtubeService,
}) => {
  return (
    showVideoModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Video className="text-red-500" size={28} />
              Tutorial Videos
              {selectedProject && (
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                  for {selectedProject.title}
                </span>
              )}
            </h2>
            <button
              onClick={() => {
                setShowVideoModal(false);
                setCurrentPlayingVideo(null);
                setIsVideoMinimized(false);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tutorials... (e.g., React basics)"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVideoSearch(videoSearchQuery)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
              <button
                onClick={() => handleVideoSearch(videoSearchQuery)}
                disabled={videosLoading}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>

          {/* Video Player or Videos Grid */}
          <div className="flex-1 overflow-y-auto max-h-[70vh] p-6 bg-white dark:bg-gray-900">
            {currentPlayingVideo ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                    🎥 Video is now playing in floating player! You can continue working while watching.
                  </p>
                </div>
                <iframe
                  width="100%"
                  height="400"
                  src={youtubeService.getEmbedUrl(currentPlayingVideo.id.videoId)}
                  title={currentPlayingVideo.snippet.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg shadow-lg"
                />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{currentPlayingVideo.snippet.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{currentPlayingVideo.snippet.channelTitle}</p>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setCurrentPlayingVideo(null)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Back to Videos
                  </button>
                  <button
                    onClick={() => {
                      setIsVideoMinimized(false);
                      setShowVideoModal(false);
                    }}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Float Video
                  </button>
                </div>
              </div>
            ) : videosLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-300">Discovering tutorials...</p>
                </div>
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <motion.div
                    key={video.id.videoId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setCurrentPlayingVideo(video)}
                  >
                    {/* Thumbnail */}
                    <div className="relative group overflow-hidden">
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full h-40 object-cover transition-transform group-hover:scale-110 duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <Play 
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity scale-150" 
                          size={40}
                          fill="currentColor"
                        />
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {video.snippet.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {video.snippet.channelTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {video.snippet.description}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(youtubeService.getVideoUrl(video.id.videoId));
                            setToast({
                              message: 'Link copied!',
                              type: 'success'
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Video className="mx-auto mb-4 text-gray-400" size={64} />
                  <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">No videos found</p>
                  <p className="text-gray-500 dark:text-gray-400">Try different keywords or check your spelling</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  );
};

export default VideoModal;

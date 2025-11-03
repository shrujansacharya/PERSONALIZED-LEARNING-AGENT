
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, MessageCircle } from 'lucide-react';

interface LearningModeModalProps {
  showLearningModeModal: boolean;
  setShowLearningModeModal: (show: boolean) => void;
  handleLearningModeSelect: (mode: 'video' | 'chatbot') => Promise<void>;
}

const LearningModeModal: React.FC<LearningModeModalProps> = ({
  showLearningModeModal,
  setShowLearningModeModal,
  handleLearningModeSelect,
}) => {
  return (
    <AnimatePresence>
      {showLearningModeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Learning Mode
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLearningModeModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(239, 68, 68, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLearningModeSelect('video')}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full group-hover:bg-red-100 dark:group-hover:bg-red-900/30"
                  >
                    <Video className="text-red-600" size={24} />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Video Tutorials
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Step-by-step videos from experts
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLearningModeSelect('chatbot')}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                  >
                    <MessageCircle className="text-green-600" size={24} />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Assistant
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time personalized guidance
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LearningModeModal;

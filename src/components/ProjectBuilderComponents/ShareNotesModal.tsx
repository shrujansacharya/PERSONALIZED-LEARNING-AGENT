
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProjectTemplate } from './types';

interface ShareNotesModalProps {
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  projectNotes: string;
  selectedProject: ProjectTemplate | null;
  setToast: (toast: { message: string; type: 'success' | 'error'; duration?: number } | null) => void;
}

const ShareNotesModal: React.FC<ShareNotesModalProps> = ({
  showShareModal,
  setShowShareModal,
  projectNotes,
  selectedProject,
  setToast,
}) => {
  return (
    <AnimatePresence>
      {showShareModal && (
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
                Share Your Notes
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(59, 130, 246, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigator.clipboard.writeText(projectNotes);
                  setToast({ message: 'Notes copied to clipboard!', type: 'success', duration: 3000 });
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                  >
                    📋
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Copy to Clipboard
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Copy notes to paste anywhere
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const blob = new Blob([projectNotes], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedProject?.title || 'Project'}_Notes.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setToast({ message: 'Notes downloaded as text file!', type: 'success', duration: 3000 });
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                  >
                    📥
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Download as File
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Save notes as a text file
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(168, 85, 247, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const subject = encodeURIComponent(`Check out my ${selectedProject?.title || 'Project'} Notes!`);
                  const body = encodeURIComponent(`Hi!\n\nI wanted to share my organized notes for the ${selectedProject?.title || 'project'}:\n\n${projectNotes}\n\nThese notes were created using AI to help with learning!`);
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                  >
                    ✉️
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Share via Email
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send notes through email
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(239, 68, 68, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${selectedProject?.title || 'Project'} Notes`,
                      text: projectNotes,
                      url: window.location.href
                    });
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(projectNotes);
                    setToast({ message: 'Notes copied! Share with your preferred app.', type: 'success', duration: 3000 });
                  }
                  setShowShareModal(false);
                }}
                className="w-full p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full group-hover:bg-red-100 dark:group-hover:bg-red-900/30"
                  >
                    📤
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Share to Apps
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Share with other apps on your device
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

export default ShareNotesModal;

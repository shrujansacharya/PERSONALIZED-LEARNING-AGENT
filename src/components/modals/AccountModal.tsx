// src/components/modals/AccountModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { X, User, LogOut, Upload, Camera, Mail, Calendar, BookOpen, Target, TrendingUp, Award, Settings } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      setLoading(true);
      try {
        // 1. Get the authentication token
        const token = await user.getIdToken();

        // 2. Add the token to the fetch request
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch user data.");
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const user = auth.currentUser;
    if (!user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', selectedImage);

    try {
      // 3. Get the token for the upload request
      const token = await user.getIdToken();

      // 4. Add the token to the upload request headers
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}/upload-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({ ...userData, profileImage: data.profileImage });
        onProfileUpdate(); // Notify parent component to update
        alert("Profile image uploaded successfully!");
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  const getPerformanceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'average': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'weak': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-black shadow-2xl overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                backgroundSize: '60px 60px'
              }}></div>
            </div>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <X size={20} />
            </motion.button>

            <div className="h-full overflow-y-auto">
              <div className="flex flex-col min-h-full">
                {/* Header Section */}
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="relative px-6 py-8 text-center border-b border-white/10"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative inline-block mb-4"
                  >
                    {userData?.profileImage ? (
                      <div className="relative">
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-xl mx-auto"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full shadow-lg">
                          <Camera size={14} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-xl mx-auto">
                        <User size={32} className="text-white" />
                      </div>
                    )}
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {userData?.name || 'Explorer'}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-white/80 mb-4"
                  >
                    Your Learning Profile
                  </motion.p>

                  {/* Image Upload Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20 text-sm">
                      <Upload size={16} className="mr-2" />
                      {selectedImage ? selectedImage.name : "Update Picture"}
                      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                    {selectedImage && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleImageUpload}
                        disabled={uploading}
                        className="ml-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-lg text-sm"
                      >
                        {uploading ? 'Uploading...' : 'Confirm'}
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex-1 px-6 py-6"
                >
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="inline-block w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
                      <p className="text-white text-sm">Loading your information...</p>
                    </motion.div>
                  ) : userData ? (
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
                      >
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3">
                            <User size={18} className="text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Personal Information</h3>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <Mail size={16} className="text-white/70 mr-3" />
                            <div className="flex-1">
                              <p className="text-white/60 text-xs">Email</p>
                              <p className="text-white font-medium text-sm">{userData.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <Calendar size={16} className="text-white/70 mr-3" />
                            <div className="flex-1">
                              <p className="text-white/60 text-xs">Date of Birth</p>
                              <p className="text-white font-medium text-sm">{userData.dob || 'Not set'}</p>
                            </div>
                          </div>

                          <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <BookOpen size={16} className="text-white/70 mr-3" />
                            <div className="flex-1">
                              <p className="text-white/60 text-xs">Class</p>
                              <p className="text-white font-medium text-sm">{userData.class || 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Learning Profile */}
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
                      >
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3">
                            <Target size={18} className="text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Learning Profile</h3>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <Settings size={16} className="text-white/70 mr-3" />
                            <div className="flex-1">
                              <p className="text-white/60 text-xs">Learning Style</p>
                              <p className="text-white font-medium text-sm">{userData.learningStyle || 'Not set'}</p>
                            </div>
                          </div>

                          <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <TrendingUp size={16} className="text-white/70 mr-3" />
                            <div className="flex-1">
                              <p className="text-white/60 text-xs">Interests</p>
                              <p className="text-white font-medium text-sm">{userData.interests || 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Performance Levels */}
                      {userData.performanceLevels && Object.keys(userData.performanceLevels).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
                        >
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3">
                              <Award size={18} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Performance Levels</h3>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(userData.performanceLevels).map(([subject, level], index) => (
                              <motion.div
                                key={subject}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className={`p-3 rounded-lg border-2 ${getPerformanceColor(level as string)} backdrop-blur-sm`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm">{subject}</span>
                                  <span className="text-xs font-bold uppercase tracking-wide">
                                    {level as string}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="text-red-400 text-sm mb-3">Failed to load user data</div>
                      <button
                        onClick={fetchUserData}
                        className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all duration-300 text-sm"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}
                </motion.div>

                {/* Footer with Logout */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-6 border-t border-white/10"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-xl"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountModal;
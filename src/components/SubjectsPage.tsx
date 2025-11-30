// SubjectsPage.tsx (Updated with 60% black glassmorphic cards and neon blue shadows)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Calculator, FlaskRound as Flask, Globe, MessageSquare, Languages, Atom, ArrowLeft, Search, Code, Laptop, Database, Beaker, Landmark, FileText, X, File, MessageCircle, Eye, Bot, Download, Calendar, Clock, Filter, Grid, List, Star, CheckCircle, AlertCircle, PlayCircle, Image as ImageIcon, Video as VideoIcon, FileType, FileText as FileTextIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subjectDetails, categories } from '../utils/subjects';
import { useThemeStore } from '../store/theme';
import { useQuizStore } from '../store/quiz';
import { auth } from '../lib/firebase';

// Map string icon names to Lucide-React components
const iconMap: { [key: string]: React.ElementType } = {
  'Calculator': Calculator,
  'Flask': Flask,
  'Globe': Globe,
  'Book': Book,
  'Languages': Languages,
  'Atom': Atom,
  'Beaker': Beaker,
  'Landmark': Landmark,
  'Code': Code,
  'Laptop': Laptop,
  'Database': Database,
};

// --- UPDATE 1: Use mimeType for checks ---
const isImage = (mimeType: string) => {
  return mimeType && mimeType.startsWith('image/');
};

const isVideo = (mimeType: string) => {
    return mimeType && mimeType.startsWith('video/');
};

const getFileTypeIcon = (mimeType: string) => {
  if (isImage(mimeType)) return ImageIcon;
  if (isVideo(mimeType)) return VideoIcon;
  return FileTextIcon;
};
// --- End Update 1 ---

export const SubjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<(typeof subjectDetails)[0] | null>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [actionableMaterial, setActionableMaterial] = useState<any | null>(null);
  const [analyzingMaterial, setAnalyzingMaterial] = useState<any | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState('All');
  const navigate = useNavigate();

  const { setTheme, getThemeStyles, setDynamicBackgrounds } = useThemeStore();
  const { answers, setAnswer } = useQuizStore();
  const theme = getThemeStyles();
  
  const VITE_BACKEND_URL = 'http://localhost:5001'; // Hardcode from .env

  const fetchUploadedMaterials = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${VITE_BACKEND_URL}/api/materials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedMaterials(data);
      } else {
        console.error('Failed to fetch uploaded materials:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching uploaded materials:', error);
    }
  };

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user && !answers.interests) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${VITE_BACKEND_URL}/api/user/${user.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTheme(data?.interests);
          setAnswer('interests', data?.interests);
          setAnswer('learningStyle', data?.learningStyle);
          if (data?.generatedThemeImages) setDynamicBackgrounds(data.generatedThemeImages);
        }
      } catch (error) {
        console.error("Failed to fetch user data for theme:", error);
      }
    } else if (answers.interests) setTheme(answers.interests);
  };

  useEffect(() => {
    fetchUploadedMaterials();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const matches = subjectDetails
        .filter(subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(subject => subject.name)
        .slice(0, 3);
      setSuggestions(matches);
    } else setSuggestions([]);
  }, [searchTerm]);

  // 🔥 PRELOAD ALL BACKGROUND IMAGES — FIXES THE FLICKER
  useEffect(() => {
    if (theme.backgrounds) {
      theme.backgrounds.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [theme.backgrounds]);

  // 🎯 CAROUSEL INTERVAL - 30 SECONDS
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
      }, 30000); // 30 SECONDS - MATCHING EXPLOREMENU
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const filteredSubjects = subjectDetails.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubjectClick = (subject: (typeof subjectDetails)[0]) => setSelectedSubject(subject);
  const handleBackToSubjects = () => setSelectedSubject(null);

  // --- UPDATE 2: Filter logic uses fileMimeType ---
  const subjectMaterials = selectedSubject ? uploadedMaterials.filter(material =>
    (material.subject.toLowerCase() === selectedSubject.name.toLowerCase() ||
    (selectedSubject.name.toLowerCase() === 'mathematics' && material.subject.toLowerCase() === 'math')) &&
    (fileTypeFilter === 'All' ||
     (fileTypeFilter === 'Image' && isImage(material.fileMimeType)) ||
     (fileTypeFilter === 'Video' && isVideo(material.fileMimeType)) ||
     (fileTypeFilter === 'Document' && !isImage(material.fileMimeType) && !isVideo(material.fileMimeType)))
  ) : [];
  // --- End Update 2 ---

  const SubjectIcon = selectedSubject ? iconMap[selectedSubject.icon] : null;

  // --- UPDATE 3: Send material._id to analysis endpoint ---
  const handleAnalyzeAndChat = async (material: any) => {
    if (!selectedSubject || !material) return;

    setIsAnalyzing(true);
    setActionableMaterial(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");
      const token = await user.getIdToken();

      const response = await fetch(`${VITE_BACKEND_URL}/api/materials/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          materialId: material._id, // Send ID instead of filePath
          comment: material.comment || '' // Pass comment from material
        }),
      });
      // --- End Update 3 ---

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze material.');
      }

      const { context } = await response.json();

      // Updated: Pass comment in state for better placeholder
      navigate(`/subjects/${selectedSubject.id}/chat`, { state: { context, comment: material.comment || '' } });

    } catch (error) {
      console.error("Analysis failed:", error);
      // alert(`Sorry, we couldn't analyze that material. Please try again later. Error: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 relative font-poppins text-white overflow-hidden">

      {/* 🔥 SEAMLESS CROSSFADE - NO BLACK SCREEN */}
      <div className="absolute inset-0 overflow-hidden">
        {theme.backgrounds?.map((bg, index) => (
          <motion.div
            key={bg}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bg})`,
              zIndex: index === currentBackgroundIndex ? 10 : 0
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentBackgroundIndex ? 1 : 0 
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut" 
            }}
          />
        ))}
      </div>

      {/* Black overlay (UPDATED: Deeper, cosmic gradient overlay + blur) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-20"></div>

      <div className="relative max-w-7xl mx-auto z-30">
        {!selectedSubject && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/explore-menu')}
                className="p-3 bg-indigo-600/80 text-white rounded-full shadow-lg hover:bg-indigo-700/80 transition-all border border-indigo-400/50"
              >
                <ArrowLeft size={20} />
              </motion.button>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400 drop-shadow-lg">
                Learn Smarter
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 w-full md:w-auto">
              {answers.learningStyle && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  // UPDATED: Glassmorphic badge
                  className="p-3 bg-black/40 backdrop-blur-lg text-white rounded-full font-semibold flex items-center justify-center gap-2 border border-white/20"
                >
                  <span>Learning Style:</span>
                  <span className="capitalize font-bold text-teal-300">{answers.learningStyle}</span>
                </motion.div>
              )}
              <div className="relative w-full sm:w-72">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Find a subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // UPDATED: Neon input style
                  className="w-full pl-12 pr-4 py-3 border border-cyan-500/50 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md transition-all bg-black/40 text-white placeholder:text-gray-400"
                />
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    // UPDATED: Glassmorphic suggestions box
                    className="absolute w-full mt-2 bg-black/80 rounded-lg shadow-lg z-20 backdrop-blur-md border border-white/10"
                  >
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-4 py-2 text-white hover:bg-teal-600/30 cursor-pointer transition-colors"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!selectedSubject ? (
            <motion.div
              key="subject-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className=""
            >
              <div className="flex flex-wrap gap-3 mb-8">
                {categories.map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    // UPDATED: Neon filter buttons
                    className={`px-4 py-2 rounded-full shadow-md text-sm font-medium transition-all ${selectedCategory === category 
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-teal-500/50' 
                      : 'bg-black/40 text-gray-200 hover:bg-white/10 border border-white/20'}`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject, idx) => {
                    const IconComponent = iconMap[subject.icon];
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        whileHover={{ 
                          scale: 1.03, 
                          y: -5,
                          // UPDATED: Stronger neon blue/indigo shadow
                          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.8)`
                        }}
                        className="relative p-6 rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 border border-cyan-500/30"
                        style={{
                          // UPDATED: Exact glassmorphic background
                          background: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(59, 130, 246, 0.3)'
                        }}
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className="flex items-center gap-5">
                          <motion.div 
                            whileHover={{ rotate: 360 }} 
                            transition={{ duration: 0.8 }} 
                            className={`p-3 rounded-full bg-gradient-to-br ${subject.color} text-white shadow-lg shadow-black/50`}
                          >
                            {IconComponent && <IconComponent size={40} />}
                          </motion.div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-white">{subject.name}</h3>
                            <p className="text-sm text-white/90">{subject.description}</p>
                            <p className="text-xs mt-1 text-white/70">{subject.category}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/subjects/${subject.id}/chat`);
                          }}
                          // UPDATED: Neon chat button
                          className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-full shadow-xl shadow-teal-500/40 hover:from-teal-600 hover:to-indigo-700 transition-all"
                        >
                          <MessageSquare size={20} />
                        </motion.button>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white col-span-full text-center text-lg font-medium"
                  >
                    No subjects found. Try something else!
                  </motion.p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="subject-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-20"
            >
              <div className="relative w-screen h-screen p-6 md:p-8">
                {/* Back/Chat Header - UPDATED: Glassmorphic with neon border */}
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-none shadow-2xl"></div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 text-white p-6 md:p-8 rounded-none"
                >
                  <div className="flex items-center justify-between mb-8 bg-black/60 p-4 rounded-xl shadow-lg backdrop-blur-md border-2 border-indigo-400/50">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBackToSubjects}
                      className="p-3 bg-black/40 text-white rounded-full shadow-md hover:bg-white/10 transition-all border border-white/20"
                    >
                      <ArrowLeft size={20} />
                    </motion.button>
                    <div className="flex items-center gap-4">
                      {/* Status Message */}
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white font-medium border border-green-500/50 shadow-md shadow-green-500/30">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span>Hi! How can I help you?</span>
                      </div>
                      {/* Chat Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(`/subjects/${selectedSubject.id}/chat`)}
                        className="w-16 h-16 bg-gradient-to-br from-teal-600 via-indigo-700 to-purple-800 text-white rounded-full shadow-xl shadow-purple-600/50 hover:from-teal-700 hover:via-indigo-800 hover:to-purple-900 transition-all duration-300 flex items-center justify-center border border-white/10"
                      >
                        <Bot size={28} className="mx-auto" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-6 bg-black/40 rounded-full shadow-xl backdrop-blur-md border-2 border-cyan-400/50">
                      {SubjectIcon && <SubjectIcon size={64} className="text-cyan-400" />}
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug text-teal-300 drop-shadow-lg">{selectedSubject.name}</h2>
                      <p className="text-base md:text-lg text-gray-200 mt-1 font-medium">{selectedSubject.description}</p>
                    </div>
                  </div>

                  <div className="space-y-8 h-[calc(100vh-280px)] overflow-y-auto pb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      // UPDATED: Glassmorphic uploads panel
                      className="bg-black/40 p-6 rounded-xl shadow-2xl border border-teal-500/30 backdrop-blur-xl"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold flex items-center gap-3 text-white">
                          <FileText size={28} className="text-teal-400" />
                          Teacher's Uploads
                        </h3>
                        <div className="flex gap-2">
                          {['All', 'Image', 'Video', 'Document'].map(type => {
                            const IconComponent = type === 'Image' ? ImageIcon : type === 'Video' ? VideoIcon : FileTextIcon;
                            return (
                              <motion.button
                                key={type}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFileTypeFilter(type)}
                                // UPDATED: Neon filter buttons
                                className={`flex items-center gap-2 p-3 rounded-full font-medium transition-all shadow-md ${fileTypeFilter === type ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-teal-500/50' : 'bg-black/50 text-gray-200 hover:bg-white/10 border border-white/20'}`}
                              >
                                <IconComponent size={18} />
                                <span className="hidden sm:inline">{type}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {subjectMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                          {subjectMaterials.map((material, index) => {
                            // --- UPDATE 4: Use fileMimeType ---
                            const FileIcon = getFileTypeIcon(material.fileMimeType);
                            return (
                              <motion.div
                                key={index}
                                whileHover={{ 
                                  scale: 1.05, 
                                  y: -5, 
                                  // UPDATED: Neon shadow on hover
                                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.5), 0 10px 20px rgba(0,0,0,0.4)" 
                                }}
                                onClick={() => setActionableMaterial(material)}
                                // UPDATED: Glassmorphic file card
                                className="bg-black/50 rounded-2xl shadow-xl border border-white/10 transition-all duration-300 hover:bg-black/40 cursor-pointer p-6 relative backdrop-blur-md"
                              >
                                {material.comment && (
                                  <div className="bg-purple-900/40 text-purple-200 p-3 rounded-xl mb-4 border-l-4 border-pink-400 shadow-inner">
                                    <h4 className="font-bold text-sm">Task:</h4>
                                    <p className="text-xs italic mt-1">{material.comment}</p>
                                  </div>
                                )}
                                <div className="relative flex items-center justify-center h-40 mb-4 rounded-xl overflow-hidden bg-black/60 border border-white/10">
                                  {/* --- UPDATE 5: Use fileData and fileMimeType --- */}
                                  {isImage(material.fileMimeType) ? (
                                    <img src={material.fileData} alt={material.fileName} className="w-full h-full object-cover" />
                                  ) : isVideo(material.fileMimeType) ? (
                                    <>
                                      <video src={material.fileData} className="w-full h-full object-cover" controls={false} />
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                                        <PlayCircle size={48} className="text-teal-400 drop-shadow-lg" />
                                      </div>
                                    </>
                                  ) : (
                                    <FileIcon size={60} className="text-teal-300 drop-shadow-lg" />
                                  )}
                                  {/* --- End Update 5 --- */}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-sm font-medium text-gray-200 truncate flex-1">{material.fileName}</p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <FileTextIcon size={60} className="mb-3" />
                          <p className="text-lg font-medium">No materials uploaded for this subject/filter.</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {actionableMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
              onClick={() => setActionableMaterial(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                // UPDATED: Glassmorphic Action Modal
                className="bg-black/70 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-md relative border border-teal-500/30 text-white p-6 text-center shadow-teal-500/30"
              >
                <h3 className="font-bold text-2xl mb-2 text-teal-300">Choose an Action</h3>
                <p className="text-sm text-gray-300 mb-6 truncate" title={actionableMaterial.fileName}>
                  For file: <strong>{actionableMaterial.fileName}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={() => {
                      setSelectedFile(actionableMaterial);
                      setActionableMaterial(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-700/80 hover:bg-gray-600 transition-colors rounded-lg font-semibold border border-white/20 shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Eye size={20} />
                    View File
                  </motion.button>
                  <motion.button
                    onClick={() => handleAnalyzeAndChat(actionableMaterial)}
                    disabled={isAnalyzing}
                    // UPDATED: Neon Gradient Analyze Button
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 transition-all rounded-lg font-semibold disabled:opacity-50 disabled:cursor-wait shadow-xl shadow-teal-500/40"
                    whileHover={{ scale: 1.05 }}
                  >
                    {isAnalyzing ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Bot size={20} />
                        Analyze with Chatbot
                      </>
                    )}
                  </motion.button>
                </div>
                <button
                  onClick={() => setActionableMaterial(null)}
                  className="absolute top-3 right-3 text-gray-400 bg-black/50 rounded-full p-2 hover:bg-red-500/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- UPDATE 6: View File Modal --- */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              // UPDATED: Glassmorphic File View Modal
              className="bg-black/70 backdrop-blur-xl rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden relative border border-teal-500/30"
            >
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-4 right-4 text-gray-300 bg-black/50 rounded-full p-3 hover:bg-red-600/50 transition-colors z-10 border border-white/10"
              >
                <X size={28} />
              </button>

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-teal-300">{selectedFile.fileName}</h3>
                {selectedFile.comment && (
                  <div className="bg-purple-900/30 text-purple-200 p-4 rounded-lg w-full text-base font-medium mb-4 border-l-4 border-pink-400 shadow-inner">
                    <p><strong>Task:</strong> {selectedFile.comment}</p>
                  </div>
                )}

                <div className="flex items-center justify-center max-h-[70vh] w-full bg-black/40 rounded-xl p-5 shadow-lg border border-white/10">
                  {isImage(selectedFile.fileMimeType) ? (
                    <img
                      src={selectedFile.fileData} // Use Base64 data
                      alt={selectedFile.fileName}
                      className="max-h-[70vh] object-contain shadow-md rounded-lg"
                    />
                  ) : isVideo(selectedFile.fileMimeType) ? (
                    <video
                      src={selectedFile.fileData} // Use Base64 data
                      className="max-h-[70vh] object-contain shadow-md rounded-lg"
                      controls
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <File size={72} className="text-teal-300 mb-4" />
                      <p className="text-base text-gray-300 font-medium">File preview not available.</p>
                      {/* Make the download link use Base64 data */}
                      <a
                        href={selectedFile.fileData} // Use Base64 data
                        download={selectedFile.fileName} // Add download attribute
                        className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-lg hover:from-teal-600 hover:to-indigo-700 transition-colors shadow-md text-base"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* --- End Update 6 --- */}


        {isAnalyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
            <Bot size={48} className="text-teal-400 animate-pulse" />
            <p className="text-white text-lg font-medium mt-4">Analyzing material, please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
};
// UploadedMaterialsList.tsx - Updated with enhancements
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, File, Image as ImageIcon, Users, Filter, ChevronRight, FileText } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { subjectDetails } from '../utils/subjects';

interface UploadedMaterialsListProps {
    onBack: () => void;
}

const isImage = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && imageExtensions.includes(extension);
};

const isVideo = (fileName: string) => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && videoExtensions.includes(extension);
};

const AssignedStudentsSummary: React.FC<{ students: any[] }> = ({ students }) => {
    if (!students || students.length === 0) {
        return <span className="text-gray-500">No students assigned</span>;
    }
    const totalStudents = students.length;
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} />
            <span title={students.map(s => s.name).join(', ')}>
                Assigned to <strong className="font-semibold text-gray-700 dark:text-gray-300">{totalStudents} student(s)</strong>
            </span>
        </div>
    );
};

const UploadedMaterialsList: React.FC<UploadedMaterialsListProps> = ({ onBack }) => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [selectedClass, setSelectedClass] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const availableSubjects = ['All', ...subjectDetails.map(s => s.name)];
    const availableClasses = ['All', '4th std', '5th std', '6th std', '7th std', '8th std', '9th std', '10th std'];

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;
                const idToken = await user.getIdToken();

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials`, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMaterials(data);
                } else {
                    console.error('Failed to fetch materials:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);
    
    const filteredMaterials = useMemo(() => {
        return materials.filter(material => {
            const subjectMatch = selectedSubject === 'All' || material.subject === selectedSubject;
            const classMatch = selectedClass === 'All' || (material.targetStudents && material.targetStudents.some((student: any) => 
                student?.class?.trim().toLowerCase() === selectedClass.trim().toLowerCase()
            ));
            const searchMatch = searchQuery === '' || 
                material.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (material.comment && material.comment.toLowerCase().includes(searchQuery.toLowerCase()));

            return subjectMatch && classMatch && searchMatch;
        });
    }, [materials, selectedSubject, selectedClass, searchQuery]);

    const handleDelete = async (materialId: string) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
             try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;
                const idToken = await user.getIdToken();

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials/${materialId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${idToken}` },
                });

                if (response.ok) {
                    alert('Material deleted successfully.');
                    setMaterials(prev => prev.filter(m => m._id !== materialId));
                } else {
                    alert('Failed to delete material.');
                }
            } catch (error) {
                console.error('Error deleting material:', error);
                alert('An error occurred while deleting the material.');
            }
        }
    };
    
    if (loading) {
        return <div className="p-8 text-center text-lg dark:text-white">Loading materials...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-h-screen">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeft size={24} className="text-gray-800 dark:text-white" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Uploaded Materials</h2>
            </div>

            {/* Enhanced Filters */}
            <div className="sticky top-0 z-10 p-4 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <Filter size={18} />
                    Filters
                </div>
                <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                    <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        {availableSubjects.map(subject => (<option key={subject} value={subject}>{subject === 'All' ? 'All Subjects' : subject}</option>))}
                    </select>
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        {availableClasses.map(cls => (<option key={cls} value={cls}>{cls === 'All' ? 'All Classes' : cls}</option>))}
                    </select>
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[200px]"
                    />
                </div>
                <button 
                    onClick={() => { setSelectedSubject('All'); setSelectedClass('All'); setSearchQuery(''); }} 
                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-sm transition-all"
                >
                    Clear
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.length > 0 ? filteredMaterials.map((material: any) => (
                    <motion.div
                        key={material._id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group relative p-6 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-50/50 to-transparent dark:from-purple-900/20" />
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-8" title={material.fileName}>{material.fileName}</h4>
                            <button onClick={() => handleDelete(material._id)} className="text-red-500 hover:text-red-700 p-1 relative z-10">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        {material.comment && (<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 relative z-10"><strong>Task:</strong> {material.comment}</p>)}
                        <div className="mb-3 relative z-10"><AssignedStudentsSummary students={material.targetStudents} /></div>
                        <div className="flex-grow flex items-center justify-center p-6 mt-auto border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 relative overflow-hidden">
                            {isImage(material.fileName) ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}${material.filePath}`}
                                    alt={material.fileName}
                                    className="max-h-32 object-cover w-full group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            ) : isVideo(material.fileName) ? (
                                <video
                                    src={`${import.meta.env.VITE_BACKEND_URL}${material.filePath}`}
                                    className="max-h-32 object-cover w-full"
                                    muted
                                    playsInline
                                    onMouseEnter={e => (e.currentTarget.play())}
                                    onMouseLeave={e => (e.currentTarget.pause())}
                                />
                            ) : (
                                <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 relative z-10">
                                    <File size={48} className="mr-3" />
                                    <span className="text-sm font-medium">{material.fileName.split('.').pop()?.toUpperCase()} File</span>
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg relative z-10">
                            <ChevronRight size={20} className="text-purple-600" />
                        </button>
                    </motion.div>
                )) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                    >
                        <FileText className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No materials yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start by uploading your first teaching resource.</p>
                        <button onClick={() => {/* Navigate to upload - implement as needed */}} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg transition-all">
                            Upload Material
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default UploadedMaterialsList;
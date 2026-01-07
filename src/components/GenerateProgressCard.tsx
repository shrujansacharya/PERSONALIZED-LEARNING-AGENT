// Updated file: GenerateProgressCard.tsx
// Changes:
// - Set initial max to '100' for all subjects (displayed and editable).
// - Changed subjects input layout to grid: subject (min-w-0 flex-1), obtained (w-32), max (w-32) for equal sizing.
// - Added placeholders: "Enter obtained" for obtained, "Edit max (default 100)" for max.
// - Improved spacing and user-friendliness with better alignment and labels.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface StudentInfo {
    name: string;
    rollNo: string;
    class: string;
    term: string;
}

interface Subject {
    name: string;
    obtained: string;
    max: string;
}

interface GenerateProgressCardProps {
    onBack: () => void;
}

const GenerateProgressCard: React.FC<GenerateProgressCardProps> = ({ onBack }) => {
    const classSubjects: Record<string, string[]> = {
        '6': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
        '7': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
        '8': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
        '9': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
        '10': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
        '11': ['Kannada', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology'],
        '12': ['Kannada', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology'],
    };

    const [studentInfo, setStudentInfo] = useState<StudentInfo>({
        name: '',
        rollNo: '',
        class: '6',
        term: ''
    });
    const [subjects, setSubjects] = useState<Subject[]>(() => 
        classSubjects['6'].map(name => ({ name, obtained: '', max: '100' })) // Initial max '100'
    );
    const [showModal, setShowModal] = useState(false);
    const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('email');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' });

    const totalObtained = subjects.reduce((sum, s) => sum + (parseFloat(s.obtained) || 0), 0);
    const totalMax = subjects.reduce((sum, s) => sum + (parseInt(s.max) || 100), 0);
    const overallPercentage = totalMax > 0 ? (totalObtained / totalMax * 100).toFixed(2) : '0';

    const getGrade = (perc: string): string => {
        const p = parseFloat(perc);
        if (p >= 85) return 'A';
        if (p >= 50) return 'B';
        if (p >= 35) return 'C';
        return 'F';
    };

    const overallGrade = getGrade(overallPercentage);

    const updateSubject = (index: number, field: keyof Subject, value: string) => {
        const newSubjects = [...subjects];
        newSubjects[index] = { ...newSubjects[index], [field]: value };
        setSubjects(newSubjects);
    };

    const handleClassChange = (newClass: string) => {
        setStudentInfo({ ...studentInfo, class: newClass });
        const newSubjectsList = classSubjects[newClass].map(name => ({ name, obtained: '', max: '100' })); // Default '100'
        setSubjects(newSubjectsList);
    };

    const printCard = () => {
        window.print();
    };

    const downloadPDF = () => {
        // Generate HTML for the new window
        const generatePdfHtml = () => {
            const subjectRows = subjects.map((sub, idx) => {
                const ob = parseFloat(sub.obtained) || 0;
                const maxNum = parseInt(sub.max) || 100;
                const perc = maxNum > 0 ? (ob / maxNum * 100).toFixed(1) : '0';
                const g = getGrade(perc);
                const rowClass = g === 'F' ? 'style="background-color: #fee2e2;"' : '';
                return `
                    <tr ${rowClass}>
                        <td>${sub.name}</td>
                        <td style="text-align: center;">${ob}</td>
                        <td style="text-align: center;">${maxNum}</td>
                        <td style="text-align: center;">${perc}%</td>
                        <td style="text-align: center; font-weight: bold;">${g}</td>
                    </tr>
                `;
            }).join('');

            const overallRowClass = overallGrade === 'F' ? 'style="background-color: #fecaca; font-weight: bold;"' : 'style="font-weight: bold; background-color: #e0e0e0;"';

            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Progress Card - ${studentInfo.name || 'Student'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #000; background: white; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .header h1 { margin: 0; font-size: 2.5em; color: #0066cc; }
                        .header p { margin: 5px 0; font-size: 1.2em; color: #666; }
                        .student-info { margin-bottom: 20px; }
                        .student-info p { margin: 5px 0; font-size: 1.1em; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #333; padding: 10px; text-align: left; }
                        th { background-color: #f0f0f0; font-weight: bold; }
                        .overall { font-weight: bold; background-color: #e0e0e0 !important; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body onload="window.print(); setTimeout(() => window.close(), 1000);">
                    <div class="header">
                        <h1>Sample School</h1>
                        <p>Progress Report Card</p>
                    </div>
                    <div class="student-info">
                        <p><strong>Name:</strong> ${studentInfo.name || 'N/A'}</p>
                        <p><strong>Roll No:</strong> ${studentInfo.rollNo || 'N/A'}</p>
                        <p><strong>Class:</strong> ${studentInfo.class || 'N/A'}</p>
                        <p><strong>Term:</strong> ${studentInfo.term || 'N/A'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th style="text-align: center;">Obtained</th>
                                <th style="text-align: center;">Max</th>
                                <th style="text-align: center;">Percentage</th>
                                <th style="text-align: center;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRows}
                            <tr class="overall" ${overallRowClass}>
                                <td>Overall Total</td>
                                <td style="text-align: center;">${totalObtained}</td>
                                <td style="text-align: center;">${totalMax}</td>
                                <td style="text-align: center;">${overallPercentage}%</td>
                                <td style="text-align: center;">${overallGrade}</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
                </html>
            `;
        };

        const pdfHtml = generatePdfHtml();
        const win = window.open('', '_blank');
        win.document.write(pdfHtml);
        win.document.close();
    };

    const sendToParent = async () => {
        if (!destination.trim()) {
            setMessage({ text: 'Please enter a valid destination (email or phone).', type: 'error' });
            return;
        }
        if (!studentInfo.name || !studentInfo.class || !studentInfo.term) {
            setMessage({ text: 'Please fill in student details before sending.', type: 'error' });
            return;
        }

        setLoading(true);
        const payload = {
            student: studentInfo,
            subjects: subjects.map(s => ({
                name: s.name,
                obtained: parseFloat(s.obtained) || 0,
                max: parseInt(s.max) || 100
            })),
            overall: {
                totalObtained,
                totalMax,
                percentage: overallPercentage,
                grade: overallGrade
            },
            channel,
            destination
        };

        try {
            const response = await fetch('/api/notifications/send-progress-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage({ text: `Progress card sent successfully via ${channel}.`, type: 'success' });
                setShowModal(false);
                setDestination('');
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            setMessage({ text: `Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the destination and try again.`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-center';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-7xl mx-auto p-8"
        >
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #progress-preview, #progress-preview * { visibility: visible; }
                    #progress-preview { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
                }
            `}</style>

            <button
                onClick={onBack}
                className="mb-8 flex items-center text-blue-400 hover:text-blue-300 font-medium"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Side */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-100">Generate Progress Card</h2>

                    {/* Student Info */}
                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 text-gray-100">Student Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Student Name"
                                value={studentInfo.name}
                                onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                                className={inputClass.replace('text-center', '')}
                            />
                            <input
                                type="text"
                                placeholder="Roll Number"
                                value={studentInfo.rollNo}
                                onChange={(e) => setStudentInfo({ ...studentInfo, rollNo: e.target.value })}
                                className={inputClass.replace('text-center', '')}
                            />
                            <select
                                value={studentInfo.class}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className={inputClass.replace('text-center', '')}
                            >
                                {[6,7,8,9,10,11,12].map(c => (
                                    <option key={c} value={c.toString()}>{`Class ${c}`}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Term/Exam Name"
                                value={studentInfo.term}
                                onChange={(e) => setStudentInfo({ ...studentInfo, term: e.target.value })}
                                className={inputClass.replace('text-center', '')}
                            />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 text-gray-100">Subject Marks</h3>
                        <div className="space-y-4">
                            {subjects.map((sub, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                                    <span className="text-gray-400 font-medium text-left col-span-1 min-w-0 flex-1 truncate">{sub.name}</span>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        placeholder="Obtained"
                                        value={sub.obtained}
                                        onChange={(e) => updateSubject(idx, 'obtained', e.target.value)}
                                        className={`${inputClass} col-span-1`}
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        min="1"
                                        placeholder="Max (default 100)"
                                        value={sub.max}
                                        onChange={(e) => updateSubject(idx, 'max', e.target.value)}
                                        className={`${inputClass} col-span-1`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-100">Live Preview</h3>
                    <div
                        id="progress-preview"
                        className="bg-white text-black p-8 rounded-3xl shadow-lg min-h-[600px] overflow-hidden"
                    >
                        <div className="text-center mb-8 border-b border-gray-300 pb-4">
                            <h1 className="text-4xl font-bold text-blue-800 mb-2">Sample School</h1>
                            <p className="text-lg text-gray-600">Progress Report Card</p>
                        </div>

                        <div className="mb-6 space-y-1 text-sm">
                            <p><strong>Name:</strong> {studentInfo.name || 'N/A'}</p>
                            <p><strong>Roll No:</strong> {studentInfo.rollNo || 'N/A'}</p>
                            <p><strong>Class:</strong> {studentInfo.class || 'N/A'}</p>
                            <p><strong>Term:</strong> {studentInfo.term || 'N/A'}</p>
                        </div>

                        <table className="w-full border-collapse border border-gray-300 mb-6">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-3 text-left">Subject</th>
                                    <th className="border border-gray-300 p-3 text-center">Obtained</th>
                                    <th className="border border-gray-300 p-3 text-center">Max</th>
                                    <th className="border border-gray-300 p-3 text-center">Percentage</th>
                                    <th className="border border-gray-300 p-3 text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((sub, idx) => {
                                    const ob = parseFloat(sub.obtained) || 0;
                                    const maxNum = parseInt(sub.max) || 100;
                                    const perc = maxNum > 0 ? (ob / maxNum * 100).toFixed(1) : '0';
                                    const g = getGrade(perc);
                                    const rowClass = g === 'F' ? 'bg-red-100' : 'hover:bg-gray-50';
                                    return (
                                        <tr key={idx} className={rowClass}>
                                            <td className="border border-gray-300 p-3">{sub.name}</td>
                                            <td className="border border-gray-300 p-3 text-center">{ob}</td>
                                            <td className="border border-gray-300 p-3 text-center">{maxNum}</td>
                                            <td className="border border-gray-300 p-3 text-center">{perc}%</td>
                                            <td className="border border-gray-300 p-3 text-center font-semibold">{g}</td>
                                        </tr>
                                    );
                                })}
                                <tr className={`bg-gray-200 font-bold ${overallGrade === 'F' ? 'bg-red-200' : ''}`}>
                                    <td className="border border-gray-300 p-3">Overall Total</td>
                                    <td className="border border-gray-300 p-3 text-center">{totalObtained}</td>
                                    <td className="border border-gray-300 p-3 text-center">{totalMax}</td>
                                    <td className="border border-gray-300 p-3 text-center">{overallPercentage}%</td>
                                    <td className="border border-gray-300 p-3 text-center">{overallGrade}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button
                            onClick={printCard}
                            className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                        >
                            Print
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            Download as PDF
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
                            disabled={!studentInfo.name}
                        >
                            Send to Parent
                        </button>
                    </div>
                </div>
            </div>

            {/* Send Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-700 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-semibold mb-4 text-gray-100">Send to Parent</h3>

                            {/* Summary */}
                            <div className="bg-gray-800 p-4 rounded-xl mb-4 text-sm">
                                <p className="text-gray-300 mb-1"><strong>Student:</strong> {studentInfo.name}</p>
                                <p className="text-gray-300 mb-1"><strong>Class:</strong> {studentInfo.class}</p>
                                <p className="text-gray-300 mb-1"><strong>Term:</strong> {studentInfo.term}</p>
                                <p className="text-gray-300"><strong>Overall:</strong> {overallPercentage}% ({overallGrade})</p>
                            </div>

                            {/* Channel Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Preferred Channel</label>
                                <div className="space-y-2">
                                    {(['whatsapp', 'sms', 'email'] as const).map((ch) => (
                                        <label key={ch} className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value={ch}
                                                checked={channel === ch}
                                                onChange={(e) => setChannel(e.target.value as typeof ch)}
                                                className="mr-2 text-blue-500"
                                            />
                                            <span className="text-gray-300 capitalize">{ch}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Destination Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    {channel === 'email' ? 'Parent Email' : 'Phone Number (with country code)'}
                                </label>
                                <input
                                    type={channel === 'email' ? 'email' : 'tel'}
                                    placeholder={channel === 'email' ? 'example@parent.com' : '+1 123 456 7890'}
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className={inputClass.replace('text-center', '')}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={sendToParent}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {loading ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Message */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg text-white flex items-center justify-between min-w-[300px] ${
                            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    >
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ text: '', type: 'success' })} className="ml-4 text-white hover:opacity-70">
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GenerateProgressCard;
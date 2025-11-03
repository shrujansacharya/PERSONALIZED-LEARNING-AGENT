// Analytics.tsx   for teacher dashboard - visualizes student performance and engagement metrics
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ChartBarIcon, ChartPieIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

interface AnalyticsProps {
    onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
    const mockData = {
        studentsPerformance: [
            { name: 'Math', score: 85, color: 'from-blue-400 to-blue-600' },
            { name: 'Science', score: 92, color: 'from-green-400 to-green-600' },
            { name: 'History', score: 78, color: 'from-purple-400 to-purple-600' },
            { name: 'English', score: 88, color: 'from-orange-400 to-orange-600' }
        ],
        attendanceTrend: [95, 92, 98, 94, 96], // Last 5 classes
        engagementRate: 87
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex items-center space-x-2 mb-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
            </motion.button>

            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
                Analytics & Insights
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200"
                >
                    <div className="flex items-center mb-4">
                        <ChartPieIcon className="w-6 h-6 text-purple-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Student Performance</h2>
                    </div>
                    <div className="space-y-4">
                        {mockData.studentsPerformance.map((subject, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="font-medium text-gray-700">{subject.name}</span>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${subject.color}`}></div>
                                    <span className="text-lg font-bold text-gray-800">{subject.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Engagement Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200"
                >
                    <div className="flex items-center mb-4">
                        <ChartBarIcon className="w-6 h-6 text-green-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Engagement Rate</h2>
                    </div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600 mb-2">
                            {mockData.engagementRate}%
                        </div>
                        <p className="text-gray-600">Average class interaction</p>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${mockData.engagementRate}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Attendance Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200 col-span-1 lg:col-span-2"
                >
                    <div className="flex items-center mb-4">
                        <PresentationChartLineIcon className="w-6 h-6 text-blue-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Attendance Trend (Last 5 Classes)</h2>
                    </div>
                    <div className="flex space-x-2 justify-center">
                        {mockData.attendanceTrend.map((rate, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="w-4 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg mb-1" style={{ height: `${rate / 100 * 80}px` }}></div>
                                <span className="text-xs text-gray-600">{rate}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
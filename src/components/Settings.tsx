// Settings.tsx for teacher dashboard - manage profile, notifications, and theme
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, UserIcon, BellIcon, MoonIcon, SunIcon, CogIcon } from '@heroicons/react/24/outline';

interface SettingsProps {
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [notifications, setNotifications] = useState(true);
    const [teacherName, setTeacherName] = useState('Dr. Alice Johnson');
    const [email, setEmail] = useState('alice.johnson@example.com');

    const handleSave = () => {
        // Simulate save
        alert('Settings saved successfully!');
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
                Settings
            </h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200 max-w-md mx-auto"
            >
                {/* Profile Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex items-center mb-4">
                        <UserIcon className="w-6 h-6 text-gray-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            placeholder="Teacher Name"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex items-center mb-4">
                        <BellIcon className="w-6 h-6 text-gray-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                    </div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                            className="hidden"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                animate={{ x: notifications ? 25 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        </div>
                        <span className="text-sm text-gray-700">Enable Notifications</span>
                    </label>
                </div>

                {/* Theme Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex items-center mb-4">
                        <CogIcon className="w-6 h-6 text-gray-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Theme</h2>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex items-center space-x-2 p-3 rounded-xl transition-colors ${theme === 'light' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'}`}
                        >
                            <SunIcon className="w-5 h-5 text-yellow-500" />
                            <span>Light</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex items-center space-x-2 p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-purple-50 border-2 border-purple-500' : 'bg-gray-50'}`}
                        >
                            <MoonIcon className="w-5 h-5 text-gray-600" />
                            <span>Dark</span>
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                    Save Changes
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Settings;
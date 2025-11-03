// Calendar.tsx for teacher dashboard - monthly view with events, classes, and deadlines
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface CalendarProps {
    onBack: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onBack }) => {
    const [currentMonth, setCurrentMonth] = useState('October 2025');
    const [events, setEvents] = useState([
        { id: 1, date: '11', title: 'Math Class - 10 AM', type: 'class' },
        { id: 2, date: '15', title: 'Parent Meeting', type: 'meeting' },
        { id: 3, date: '20', title: 'Science Lab', type: 'class' },
        { id: 4, date: '25', title: 'Homework Deadline', type: 'deadline' }
    ]);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({ date: '', title: '' });

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const handleAddEvent = () => {
        if (newEvent.date && newEvent.title) {
            setEvents([...events, { id: Date.now(), date: newEvent.date, title: newEvent.title, type: 'custom' }]);
            setNewEvent({ date: '', title: '' });
            setShowAddEvent(false);
        }
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
                Calendar
            </h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">{currentMonth}</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowAddEvent(!showAddEvent)}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Event</span>
                    </motion.button>
                </div>

                {/* Add Event Modal */}
                {showAddEvent && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddEvent(false)}
                    >
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
                            <input
                                type="text"
                                placeholder="Date (e.g., 12)"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Event Title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex space-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleAddEvent}
                                    className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600"
                                >
                                    Add
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setShowAddEvent(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-400"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="font-semibold text-gray-600 py-2">{day}</div>
                    ))}
                    {days.map((day) => {
                        const dayEvents = events.filter((event) => parseInt(event.date) === day);
                        return (
                            <div key={day} className="p-2 border border-gray-200 rounded-lg h-24 relative">
                                <span className="font-medium text-gray-800">{day}</span>
                                {dayEvents.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`absolute bottom-1 left-1 right-1 text-xs p-1 rounded bg-gradient-to-r ${
                                            event.type === 'class' ? 'from-blue-400 to-blue-600 text-white' :
                                            event.type === 'meeting' ? 'from-purple-400 to-purple-600 text-white' :
                                            event.type === 'deadline' ? 'from-red-400 to-red-600 text-white' :
                                            'from-green-400 to-green-600 text-white'
                                        }`}
                                    >
                                        {event.title}
                                    </motion.div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default Calendar;
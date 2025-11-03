import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BellIcon, MagnifyingGlassIcon, UserIcon, CalendarIcon, 
    ChartBarIcon, CogIcon, DocumentIcon, LockClosedIcon, SparklesIcon,
    ChevronLeftIcon, ChevronDoubleLeftIcon, Bars3Icon,
    ArrowTrendingUpIcon, UserPlusIcon, InboxStackIcon
} from '@heroicons/react/24/outline';
import StudentManagement from './StudentManagement';
import MaterialsManager from './MaterialsManager';
import Analytics from './Analytics';
import Settings from './Settings';
import Calendar from './Calendar';

// --- (Existing) StatCard Component ---
const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    iconBg: string;
}> = ({ title, value, icon: Icon, color, iconBg }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-900 rounded-3xl shadow-lg p-6 border border-gray-700 hover:border-blue-500 flex flex-col items-center text-center"
        >
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-100">{value}</h3>
            <p className="text-gray-400">{title}</p>
        </motion.div>
    );
};

// --- (Existing) QuickActionCard Component ---
const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    iconBg: string;
    onClick: () => void;
}> = ({ title, description, icon: Icon, color, iconBg, onClick }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
            }}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative bg-gray-900 rounded-3xl shadow-md p-6 flex flex-col items-center text-center cursor-pointer border border-gray-700 hover:border-blue-500 hover:shadow-lg transition-shadow overflow-hidden"
            onClick={onClick}
        >
            <motion.div
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                variants={{
                    hover: { 
                        x: '100%', 
                        y: '100%',
                        transition: { duration: 0.7, ease: "linear" }
                    }
                }}
                initial={{ x: '-100%', y: '-100%' }}
            />
            <div className={`w-16 h-16 ${iconBg} rounded-3xl flex items-center justify-center mb-4 z-10`}>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2 z-10">
                {title}
            </h2>
            <p className="text-gray-400 text-sm z-10">
                {description}
            </p>
        </motion.div>
    );
};

// --- (Existing) WelcomeBanner Component ---
const WelcomeBanner: React.FC<{ name: string }> = ({ name }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-between"
        >
            <div>
                <h2 className="text-3xl font-bold text-white">Welcome back, {name}!</h2>
                <p className="text-lg text-blue-100 mt-1">Here's your complete overview for today.</p>
            </div>
            <SparklesIcon className="w-16 h-16 text-white/30 hidden md:block" />
        </motion.div>
    );
};

// --- (Existing) Sidebar Component ---
const Sidebar: React.FC<{
    view: string;
    setView: (view: any) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}> = ({ view, setView, isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { name: 'Dashboard', icon: ChartBarIcon, view: 'dashboard' },
        { name: 'Students', icon: UserIcon, view: 'students' },
        { name: 'Materials', icon: DocumentIcon, view: 'materials' },
        { name: 'Analytics', icon: ArrowTrendingUpIcon, view: 'analytics' },
        { name: 'Calendar', icon: CalendarIcon, view: 'calendar' },
        { name: 'Settings', icon: CogIcon, view: 'settings' },
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? "5rem" : "16rem" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-900 border-r border-gray-700 h-screen flex flex-col sticky top-0"
        >
            <div className="flex items-center justify-between p-4 h-24 border-b border-gray-700">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-2xl font-bold text-white whitespace-nowrap"
                        >
                            Teacher Portal
                        </motion.span>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 text-gray-400 hover:text-white hidden md:block"
                >
                    {isCollapsed ? <ChevronDoubleLeftIcon className="w-6 h-6 rotate-180" /> : <ChevronDoubleLeftIcon className="w-6 h-6" />}
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => setView(item.view)}
                        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                            view === item.view 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <item.icon className="w-6 h-6" />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="ml-4 whitespace-nowrap"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`flex items-center w-full p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <ChevronLeftIcon className={`w-6 h-6 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="ml-4 whitespace-nowrap"
                            >
                                {isCollapsed ? 'Expand' : 'Collapse'}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
};

// --- (Existing) RecentActivity Component ---
const RecentActivity: React.FC<{ activities: any[] }> = ({ activities }) => {
    const iconMap = {
        success: { icon: UserPlusIcon, color: 'text-green-400', bg: 'bg-green-950' },
        info: { icon: CalendarIcon, color: 'text-blue-400', bg: 'bg-blue-950' },
        warning: { icon: InboxStackIcon, color: 'text-yellow-400', bg: 'bg-yellow-950' }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-gray-900 rounded-3xl shadow-lg p-6 border border-gray-700 h-full"
        >
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Recent Activity</h2>
            <div className="space-y-6">
                {activities.slice(0, 4).map(activity => {
                    const { icon: Icon, color, bg } = iconMap[activity.type] || iconMap.info;
                    return (
                        <div key={activity.id} className="flex space-x-4">
                            <div className={`w-10 h-10 ${bg} rounded-full flex-shrink-0 flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-200">{activity.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};


const TeacherDashboard: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'students' | 'materials' | 'analytics' | 'calendar' | 'settings'>('dashboard');
    const [isPasswordProtected, setIsPasswordProtected] = useState(true);
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'New student enrolled: John Doe', time: '2 min ago', type: 'success' },
        { id: 2, message: 'Class tomorrow at 10 AM', time: '1 hour ago', type: 'info' },
        { id: 3, message: 'Material "Algebra Basics" updated.', time: '1 day ago', type: 'warning' },
        { id: 4, message: 'Quiz "Chapter 1" graded.', time: '2 days ago', type: 'info' },
    ]);
    const [teacherName, setTeacherName] = useState('');
    const [stats, setStats] = useState({
        totalStudents: 45,
        upcomingClasses: 3,
        materials: 12,
        attendanceRate: 95
    });
    
    // --- THIS IS THE CHANGE ---
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default to collapsed
    // -------------------------

    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ... (useEffect hooks remain the same) ...

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin' || password === import.meta.env.VITE_TEACHER_PASSWORD) {
            setTeacherName(name);
            setIsPasswordProtected(false);
        } else {
            alert('Incorrect password.');
            setPassword('');
        }
    };

    const filteredNotifications = notifications.filter(notif =>
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    if (isPasswordProtected) {
        // --- (Login Screen - no changes) ---
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
                <motion.div
                    className="absolute top-10 left-10 w-72 h-72 bg-blue-900 rounded-full opacity-30 blur-3xl"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-10 right-10 w-72 h-72 bg-purple-900 rounded-full opacity-30 blur-3xl"
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 p-10 bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-700"
                >
                    <div className="flex justify-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                            <LockClosedIcon className="w-10 h-10 text-white" />
                        </motion.div>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-4xl font-bold text-center text-gray-100 mb-2"
                    >
                        Teacher Access
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-center text-gray-400 mb-8"
                    >
                        Secure portal for educators
                    </motion.p>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full pl-4 pr-4 py-3 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-800 text-gray-100 placeholder-gray-400 shadow-sm text-lg transition-all"
                                required
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full pl-4 pr-4 py-3 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-800 text-gray-100 placeholder-gray-400 shadow-sm text-lg transition-all"
                                required
                            />
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg text-lg"
                        >
                            Unlock Dashboard
                        </motion.button>
                    </form>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }} className="text-center text-sm text-gray-500 mt-6">
                        Authorized access only
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    const renderContent = () => {
        const listContainerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    delayChildren: 0.3,
                    staggerChildren: 0.1,
                },
            },
        };

        switch (view) {
            case 'students':
                return <StudentManagement onBack={() => setView('dashboard')} />;
            case 'materials':
                return <MaterialsManager onBack={() => setView('dashboard')} />;
            case 'analytics':
                return <Analytics onBack={() => setView('dashboard')} />;
            case 'calendar':
                return <Calendar onBack={() => setView('dashboard')} />;
            case 'settings':
                return <Settings onBack={() => setView('dashboard')} />;
            case 'dashboard':
            default:
                return (
                    <div className="max-w-7xl mx-auto">
                        <WelcomeBanner name={teacherName} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                                    variants={listContainerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                >
                                    <StatCard title="Total Students" value={stats.totalStudents} icon={UserIcon} color="text-green-400" iconBg="bg-green-950" />
                                    <StatCard title="Upcoming Classes" value={stats.upcomingClasses} icon={CalendarIcon} color="text-blue-400" iconBg="bg-blue-950" />
                                    <StatCard title="Attendance" value={`${stats.attendanceRate}%`} icon={ChartBarIcon} color="text-purple-400" iconBg="bg-purple-950" />
                                    <StatCard title="Materials" value={stats.materials} icon={DocumentIcon} color="text-orange-400" iconBg="bg-orange-950" />
                                </motion.div>

                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    variants={listContainerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                >
                                    <QuickActionCard 
                                        title="Registered Students"
                                        description="View and manage student data."
                                        icon={UserIcon}
                                        color="text-green-400"
                                        iconBg="bg-green-950"
                                        onClick={() => setView('students')}
                                    />
                                    <QuickActionCard 
                                        title="Manage Materials"
                                        description="Upload and share resources."
                                        icon={DocumentIcon}
                                        color="text-orange-400"
                                        iconBg="bg-orange-950"
                                        onClick={() => setView('materials')}
                                    />
                                    <QuickActionCard 
                                        title="Analytics"
                                        description="View performance insights."
                                        icon={ArrowTrendingUpIcon}
                                        color="text-purple-400"
                                        iconBg="bg-purple-950"
                                        onClick={() => setView('analytics')}
                                    />
                                    <QuickActionCard 
                                        title="Calendar"
                                        description="Schedule and overview of events."
                                        icon={CalendarIcon}
                                        color="text-teal-400"
                                        iconBg="bg-teal-950"
                                        onClick={() => setView('calendar')}
                                    />
                                </motion.div>
                            </div>

                            <div className="lg:col-span-1">
                                <RecentActivity activities={notifications} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-950 min-h-screen text-gray-200 flex">
            <Sidebar 
                view={view} 
                setView={setView} 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed} 
            />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 bg-gray-950/80 backdrop-blur-md z-40 border-b border-gray-700"
                >
                    <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <Bars3Icon className="w-6 h-6" />
                            </button>
                            <div className="relative hidden md:block">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-800 text-gray-100 placeholder-gray-400 shadow-sm text-lg"
                                    aria-label="Search"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative" ref={notificationsRef}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={toggleNotifications}
                                    className="relative p-2 bg-gray-800 rounded-xl shadow-md"
                                >
                                    <BellIcon className="w-6 h-6 text-gray-300" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </motion.button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 mt-2 w-80 border border-gray-700 bg-gray-900 shadow-xl rounded-lg overflow-hidden z-50"
                                        >
                                            {/* ... (notification dropdown content) ... */}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: '#4b5563' }} // gray-600
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setIsPasswordProtected(true);
                                    setPassword('');
                                    setName('');
                                }}
                                className="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-600 transition-all"
                            >
                                Lock
                            </motion.button>
                        </div>
                    </div>
                </motion.header>
                <div className="px-8 pb-8 pt-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
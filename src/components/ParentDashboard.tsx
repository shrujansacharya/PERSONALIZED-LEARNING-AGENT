import React from 'react';
import {
  Clock,
  Award,
  BookOpen,
  AlertTriangle,
  Star,
  Brain,
  Target,
  CheckCircle,
} from 'lucide-react';

// --- (Dark Mode) RadialProgress Component ---
const RadialProgress = ({ progress, colorClass, subject }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32" viewBox="0 0 120 120">
          <circle
            className="text-gray-700" // Dark mode track
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={colorClass} // Bright color
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <span
          className={`absolute text-3xl font-bold ${colorClass}`}
        >{`${progress}%`}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-gray-200">{subject}</p>
    </div>
  );
};

// --- (Dark Mode) ProgressCard Component ---
const colorStyles = {
  blue: {
    bg: 'bg-gray-900 border border-gray-700', // Standard dark card
    iconBg: 'bg-blue-950', // Darker icon bg
    text: 'text-blue-400', // Bright text/icon
  },
  green: {
    bg: 'bg-gray-900 border border-gray-700',
    iconBg: 'bg-green-950',
    text: 'text-green-400',
  },
  purple: {
    bg: 'bg-gray-900 border border-gray-700',
    iconBg: 'bg-purple-950',
    text: 'text-purple-400',
  },
  red: {
    bg: 'bg-gray-900 border border-gray-700',
    iconBg: 'bg-red-950',
    text: 'text-red-400',
  },
};

const ProgressCard = ({ title, value, icon: Icon, color }) => {
  const styles = colorStyles[color] || colorStyles.blue;
  return (
    <div
      className={`${styles.bg} p-6 rounded-xl hover:border-gray-600 transition-colors duration-300`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 ${styles.iconBg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
          <p className={`text-2xl font-bold ${styles.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

// --- (Dark Mode) WeeklyProgressChart Component ---
const WeeklyProgressChart = ({ data }) => {
  const width = 300;
  const height = 100;
  const padding = 20;

  const getCoords = () => {
    const minScore = Math.min(...data.map((d) => d.score)) - 10;
    const maxScore = 100;
    const xStep = (width - padding * 2) / (data.length - 1);
    const yRange = maxScore - minScore;

    const points = data.map((d, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((d.score - minScore) / yRange) * (height - padding * 2);
      return { x, y, score: d.score, day: d.day };
    });
    
    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return { points, polylinePoints };
  };

  const { points, polylinePoints } = getCoords();

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height + padding}`} className="w-full">
        {/* -- Grid Lines -- */}
        {[100, 75, 50, 25].map(val => {
           const y = height - padding - ((val - Math.min(...data.map(d => d.score)) + 10) / (100 - (Math.min(...data.map(d => d.score)) - 10))) * (height - padding * 2);
           return <line key={val} x1={padding} y1={y} x2={width-padding} y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="4"/> // gray-700
        })}

        {/* -- Data Line -- */}
        <polyline
          fill="none"
          stroke="#818cf8" // indigo-400
          strokeWidth="2"
          points={polylinePoints}
        />
        
        {/* -- Data Points -- */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#818cf8" // indigo-400
              className="transition-transform duration-300 hover:scale-125"
            />
            <title>{`${p.day}: ${p.score}%`}</title>
          </g>
        ))}

        {/* -- X-Axis Labels -- */}
        {points.map((p, i) => (
           <text key={i} x={p.x} y={height + padding - 5} textAnchor="middle" fill="#9ca3af" fontSize="10"> {/* gray-400 */}
             {p.day}
           </text>
        ))}
      </svg>
    </div>
  );
};

// --- (Dark Mode) SubjectTimeBreakdown Component ---
const SubjectTimeBreakdown = ({ data }) => {
  return (
    <div className="space-y-4">
       <div className="flex w-full h-4 rounded-full overflow-hidden">
        {data.map(item => (
          <div
            key={item.subject}
            className={item.color} // Bright bg colors
            style={{ width: `${item.percent}%` }}
            role="progressbar"
            aria-label={`${item.subject}: ${item.percent}%`}
            aria-valuenow={item.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <title>{`${item.subject}: ${item.time}m (${item.percent}%)`}</title>
          </div>
        ))}
       </div>
       <div className="space-y-2">
        {data.map(item => (
          <div key={item.subject} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
              <span className="text-gray-200 font-medium">{item.subject}</span>
            </div>
            <span className="text-gray-400">{`${item.time} min`}</span>
          </div>
        ))}
       </div>
    </div>
  );
};

// --- (Dark Mode) BadgesEarned Component ---
const BadgesEarned = ({ badges }) => {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {badges.map(badge => (
        <div key={badge.name} className="flex flex-col items-center p-4 bg-gray-800 rounded-lg"> {/* Lighter bg */}
          <badge.icon className={`w-10 h-10 mb-2 ${badge.color}`} />
          <p className="text-sm font-medium text-gray-300">{badge.name}</p>
        </div>
      ))}
    </div>
  );
};

// --- (Dark Mode) MOCK DATA ---
const mockDashboardData = {
  stats: [
    { title: 'Time Spent Learning', value: '2.5 hours', icon: Clock, color: 'blue' },
    { title: 'Achievements', value: '5 badges', icon: Award, color: 'green' },
    { title: 'Lessons Completed', value: '12', icon: BookOpen, color: 'purple' },
    { title: 'Areas for Help', value: '2', icon: AlertTriangle, color: 'red' },
  ],
  recentActivity: [
    { activity: 'Completed Math Quiz', time: '2 hours ago', score: '90%' },
    { activity: 'Started Science Lesson', time: '4 hours ago', score: 'In Progress' },
    { activity: 'Earned "Math Whiz" Badge', time: 'Yesterday', score: '🏆' },
    { activity: 'Completed Reading Task', time: 'Yesterday', score: '85%' },
  ],
};

const mockFocusAreas = [
  { subject: 'Mathematics', progress: 75, status: 'Excelling', color: 'text-blue-400' },
  { subject: 'Reading', progress: 60, status: 'On Track', color: 'text-green-400' },
  { subject: 'Science', progress: 45, status: 'Needs Attention', color: 'text-red-400' },
];

const mockWeeklyScores = [
  { day: 'Mon', score: 80 },
  { day: 'Tue', score: 75 },
  { day: 'Wed', score: 85 },
  { day: 'Thu', score: 90 },
  { day: 'Fri', score: 88 },
  { day: 'Sat', score: 92 },
  { day: 'Sun', score: 90 },
];

const mockTimeBreakdown = [
  { subject: 'Math', time: 75, percent: 50, color: 'bg-blue-500' },
  { subject: 'Reading', time: 45, percent: 30, color: 'bg-green-500' },
  { subject: 'Science', time: 30, percent: 20, color: 'bg-red-500' },
];

const mockBadges = [
  { name: 'Math Whiz', icon: Star, color: 'text-yellow-400' },
  { name: 'Bookworm', icon: BookOpen, color: 'text-green-400' },
  { name: 'Curious Mind', icon: Brain, color: 'text-purple-400' },
  { name: 'Streak Starter', icon: CheckCircle, color: 'text-blue-400' },
  { name: 'Target Achiever', icon: Target, color: 'text-red-400' },
];

// --- (Dark Mode) MAIN COMPONENT: ParentDashboard ---
export const ParentDashboard = () => {
  return (
    <div className="p-8 bg-gray-950 text-gray-200 min-h-screen" role="main">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Parent Dashboard</h1>

      {/* --- Top Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockDashboardData.stats.map((stat) => (
          <ProgressCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* --- Main Chart & Breakdown Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* --- Weekly Progress Chart --- */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Weekly Quiz Performance
          </h2>
          <WeeklyProgressChart data={mockWeeklyScores} />
        </div>

        {/* --- Time Breakdown Chart --- */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">
            Time Spent by Subject
          </h2>
          <SubjectTimeBreakdown data={mockTimeBreakdown} />
        </div>
      </div>

      {/* --- Focus Areas --- */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300 mb-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-6 text-center">
          Learning Focus Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockFocusAreas.map((item) => (
            <div key={item.subject} className="flex flex-col items-center">
              <RadialProgress
                progress={item.progress}
                colorClass={item.color}
                subject={item.subject}
              />
              <span className={`mt-1 text-sm font-medium ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Activity & Badges Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Recent Activity --- */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {mockDashboardData.recentActivity.map((item) => (
              <div
                key={item.activity}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg" // Lighter bg
              >
                <div>
                  <p className="font-medium text-gray-200">{item.activity}</p>
                  <p className="text-sm text-gray-400">{item.time}</p>
                </div>
                <span className="font-semibold text-indigo-400">
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Badges Earned --- */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Badges Earned
          </h2>
          <BadgesEarned badges={mockBadges} />
        </div>
      </div>

      {/* --- Settings & Controls --- */}
      <div className="mt-8 bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Settings & Controls
        </h2>
        <div className="space-y-4">
          {/* --- Daily Time Limit --- */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-200">Daily Time Limit</p>
              <p className="text-sm text-gray-400">
                Set maximum learning time per day
              </p>
            </div>
            <select
              className="px-4 py-2 border bg-gray-700 border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Select daily time limit"
            >
              <option>1 hour</option>
              <option>2 hours</option>
              <option>3 hours</option>
              <option>4 hours</option>
            </select>
          </div>
          {/* --- Content Restrictions --- */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-200">Content Restrictions</p>
              <p className="text-sm text-gray-400">Manage accessible content</p>
            </div>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label="Manage content restrictions"
            >
              Manage
            </button>
          </div>
          {/* --- Weekly Progress Reports --- */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-200">
                Weekly Progress Reports
              </p>
              <p className="text-sm text-gray-400">
                Receive detailed learning reports
              </p> 
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
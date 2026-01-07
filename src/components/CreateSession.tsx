import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, UsersIcon, CalendarIcon, LinkIcon } from '@heroicons/react/24/outline';

type ClassItem = {
  id: string;
  name: string;
  section?: string;
};

interface CreateSessionProps {
  onBack: () => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onBack }) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');

  // 🔹 Fetch classes for dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        setError(null);

        // TODO: change URL to match your backend route
        const res = await fetch('/api/classes', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load classes');
        }

        const data = await res.json();
        // Expecting something like: [{ id, name, section }]
        setClasses(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to fetch classes');
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedClassId || !title || !date || !startTime || !meetingLink) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setFormSubmitting(true);

      // Combine date + time into one ISO string
      const startDateTime = new Date(`${date}T${startTime}:00`);

      // TODO: change URL to your actual backend route
      const res = await fetch('/api/study-group/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          classId: selectedClassId,
          title,
          description,
          startTime: startDateTime.toISOString(),
          durationMinutes,
          meetingLink,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to create session');
      }

      setSuccess('Study group session created and students will be notified.');
      setTitle('');
      setDescription('');
      setDate('');
      setStartTime('');
      setDurationMinutes(60);
      setMeetingLink('');
      setSelectedClassId('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while creating the session');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-300 hover:text-white mr-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center">
          <UsersIcon className="w-7 h-7 text-blue-400 mr-2" />
          Create Study Group Session
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-900 border border-gray-700 rounded-3xl p-6 shadow-xl"
      >
        <p className="text-gray-400 mb-6 text-sm">
          Schedule a live study group session for a specific class. Students in that class
          will see this session in their Study Group section on the student dashboard and
          can join via the meeting link.
        </p>

        {/* Status messages */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-950 border border-red-500/60 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl bg-green-950 border border-green-500/60 px-4 py-3 text-sm text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Class dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
              disabled={isLoadingClasses}
            >
              <option value="">
                {isLoadingClasses ? 'Loading classes...' : 'Select a class'}
              </option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section ? `- ${cls.section}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Session Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Algebra Exam Doubt Clearing"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Meeting link */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Meeting Link <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g., https://meet.google.com/xyz-abc-pqr"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              You can paste a Google Meet, Zoom, or any video meeting URL.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description / Agenda
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Share what topics will be discussed and any preparation students should do."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {formSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSession;

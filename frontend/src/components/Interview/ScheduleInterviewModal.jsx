import React, { useState } from 'react';
import { IconX, IconLoader2 } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';
import Notification from './Notification';

const ScheduleInterviewModal = ({ profile, onClose, onSuccess }) => {
    const { selectedSearchHistory, addInterview } = useStore();

    const [form, setForm] = useState({
        candidateEmail: profile.email || '',
        interviewerEmail: '',
        meetingDate: '',
        meetingTime: '',
    });

    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const isValid = form.candidateEmail && form.interviewerEmail && form.meetingDate && form.meetingTime;

    const handleSchedule = async () => {
        if (!isValid || isLoading) return;

        setIsLoading(true);

        try {
            const dateTimeString = `${form.meetingDate}T${form.meetingTime}:00+05:30`;

            const meetingData = {
                organizer_email: form.interviewerEmail,
                subject: `Interview Round - ${selectedSearchHistory?.job_description?.split(' ').slice(0, 3).join(' ') || 'Position'}`,
                attendees: [form.interviewerEmail, form.candidateEmail],
                start_time: dateTimeString,
                search_id: selectedSearchHistory.search_id,
                applicant_id: profile.applicant_id,
                duration_minutes: 60,
            };

            const response = await fetch('http://localhost:8000/api/schedule-meeting', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(meetingData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setNotification({ message: errorData.message || 'Failed to schedule meeting', type: 'error' });
                return;
            }

            const result = await response.json();

            // Add to store
            addInterview({
                id: result.id,
                applicantId: profile.applicant_id,
                roundNumber: 1, // Calculate based on existing interviews
                date: form.meetingDate,
                time: form.meetingTime,
                meetingId: result.id,
                status: 'scheduled',
                verdict: 'pending',
                interviewerEmail: form.interviewerEmail,
                candidateEmail: form.candidateEmail,
            });

            setNotification({ message: 'Meeting scheduled successfully!', type: 'success' });

            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Error scheduling meeting:', error);
            setNotification({ message: 'Failed to schedule meeting', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
                >
                    <Notification notification={notification} onClose={() => setNotification(null)} />

                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Schedule Interview
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded">
                            <IconX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Candidate Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={form.candidateEmail}
                                onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Interviewer Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={form.interviewerEmail}
                                onChange={(e) => setForm({ ...form, interviewerEmail: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.meetingDate}
                                    onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={form.meetingTime}
                                    onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSchedule}
                            disabled={!isValid || isLoading}
                            className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 mt-6 ${isValid && !isLoading
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-300 dark:bg-neutral-600 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <IconLoader2 className="h-5 w-5 animate-spin" />
                                    <span>Scheduling...</span>
                                </>
                            ) : (
                                <span>Schedule Interview</span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ScheduleInterviewModal;

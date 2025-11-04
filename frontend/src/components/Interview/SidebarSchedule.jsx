import React, { useState, useEffect } from 'react';
import { IconX, IconLoader2, IconLink } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';

const SidebarSchedule = ({ profile, onClose, onSuccess }) => {
    const { interviews, selectedSearchHistory } = useStore();

    const meetingRounds = ['Interview 1', 'Interview 2', 'Salary Negotiation'];

    const [form, setForm] = useState({
        candidateEmail: profile.email || '',
        interviewerEmail: '',
        meetingDate: '',
        meetingTime: '',
        meetingType: meetingRounds[0],
    });

    const [isDisabled, setIsDisabled] = useState(false);
    const [existingMeeting, setExistingMeeting] = useState(null);

    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check if a scheduled interview exists for current applicant and meetingType
    useEffect(() => {
        const scheduledMeeting = interviews.find(
            (meeting) =>
                meeting.applicantId === profile.applicant_id &&
                meeting.status === 'scheduled'
        );

        if (scheduledMeeting) {
            setIsDisabled(true);
            setExistingMeeting(scheduledMeeting);
            setForm({
                candidateEmail: scheduledMeeting.candidateEmail || profile.email || '',
                interviewerEmail: scheduledMeeting.interviewerEmail || '',
                meetingDate: scheduledMeeting.date || '',
                meetingTime: scheduledMeeting.time || '',
                meetingType: form.meetingType, // keep selected meetingType
            });
        } else {
            setIsDisabled(false);
            setExistingMeeting(null);
            setForm((f) => ({ ...f, candidateEmail: profile.email || '', interviewerEmail: '', meetingDate: '', meetingTime: '' }));
        }
    }, [form.meetingType, interviews, profile.applicant_id, profile.email]);

    const isValid =
        form.candidateEmail &&
        form.interviewerEmail &&
        form.meetingDate &&
        form.meetingTime &&
        !isDisabled;

    const handleSchedule = async () => {
        if (!isValid || isLoading) return;

        setIsLoading(true);

        try {
            const dateTimeString = `${form.meetingDate}T${form.meetingTime}:00+05:30`;

            const meetingData = {
                organizer_email: form.interviewerEmail,
                subject: `${form.meetingType} - ${profile.name}`,
                attendees: [form.interviewerEmail, form.candidateEmail],
                start_time: dateTimeString,
                applicant_id: profile.applicant_id,
                search_id: selectedSearchHistory?.search_id || null,
                duration_minutes: 60,
                meeting_round: form.meetingType,
            };

            console.log('Scheduling meeting with data:', meetingData);

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
                setIsLoading(false);
                return;
            }

            await response.json();

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
            <>
                {/* Dark overlay to dim rest of UI */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 bg-black z-40"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-neutral-800 shadow-xl z-50 p-6 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule Meeting</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded">
                            <IconX className="h-5 w-5" />
                        </button>
                    </div>

                    {notification && (
                        <div
                            className={`mb-4 p-3 rounded ${notification.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {notification.message}
                        </div>
                    )}

                    <div className="space-y-4 flex-grow overflow-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Meeting Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                disabled={false}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                value={form.meetingType}
                                onChange={e => setForm({ ...form, meetingType: e.target.value })}
                            >
                                {meetingRounds.map(round => (
                                    <option key={round} value={round}>
                                        {round}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Candidate Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                disabled={isDisabled}
                                value={form.candidateEmail}
                                onChange={e => setForm({ ...form, candidateEmail: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Interviewer Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                disabled={isDisabled}
                                value={form.interviewerEmail}
                                onChange={e => setForm({ ...form, interviewerEmail: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    disabled={isDisabled}
                                    value={form.meetingDate}
                                    onChange={e => setForm({ ...form, meetingDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    disabled={isDisabled}
                                    value={form.meetingTime}
                                    onChange={e => setForm({ ...form, meetingTime: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Show existing meeting info when disabled */}
                        {isDisabled && existingMeeting && (
                            <div className="mt-4 p-4 border border-green-400 rounded bg-green-50 dark:bg-green-900/30 dark:border-green-700 text-green-900 dark:text-green-300">
                                <p className="font-semibold mb-2">Meeting already scheduled:</p>

                                <p>
                                    <span className="font-medium">Round:</span> {form.meetingType}
                                </p>
                                <p>
                                    <span className="font-medium">Date:</span> {existingMeeting.date}
                                </p>
                                <p>
                                    <span className="font-medium">Time:</span> {existingMeeting.time}
                                </p>
                                <p>
                                    <span className="font-medium">Interviewer:</span> {existingMeeting.interviewerEmail}
                                </p>

                                {existingMeeting.meetingLink && (
                                    <p className="mt-2">
                                        <a
                                            href={existingMeeting.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-600 dark:text-blue-400 flex items-center gap-1"
                                        >
                                            <IconLink size={16} /> Join Teams Meeting
                                        </a>
                                    </p>
                                )}

                                {existingMeeting.webLink && (
                                    <p className="mt-1">
                                        <a
                                            href={existingMeeting.webLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-600 dark:text-blue-400 flex items-center gap-1"
                                        >
                                            <IconLink size={16} /> View in Outlook Calendar
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSchedule}
                        disabled={!isValid || isLoading}
                        className={`mt-6 w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${isValid && !isLoading
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 dark:bg-neutral-600 text-gray-500 cursor-not-allowed'
                            }`}
                        type="button"
                    >
                        {isLoading ? (
                            <>
                                <IconLoader2 className="h-5 w-5 animate-spin" />
                                <span>Scheduling...</span>
                            </>
                        ) : (
                            <span>Schedule Meeting</span>
                        )}
                    </button>
                </motion.div>
            </>
        </AnimatePresence>
    );
};

export default SidebarSchedule;

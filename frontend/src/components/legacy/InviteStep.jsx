import React, { useState } from 'react';
import { IconCheck, IconSend, IconAlertCircle, IconLoader2 } from '@tabler/icons-react';
import { IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';


const InviteStep = ({ profile, onUpdate }) => {
    const { setAtsProfiles, setSelectedAtsProfile, selectedSearchHistory, setActiveTimelineStep } = useStore();
    const timeline = profile.timeline;


    const [meetingForm, setMeetingForm] = useState({
        candidateEmail: profile.email || '',
        interviewerEmail: '',
        meetingDate: '',
        meetingTime: '',
    });


    const [notification, setNotification] = useState(null);
    const [isScheduling, setIsScheduling] = useState(false);


    const isFormValid =
        meetingForm.candidateEmail &&
        meetingForm.interviewerEmail &&
        meetingForm.meetingDate &&
        meetingForm.meetingTime;


    const getMeetingTitle = () => {
        if (selectedSearchHistory?.job_description) {
            const words = selectedSearchHistory.job_description.split(' ').slice(0, 3).join(' ');
            return `Interview for ${words}...`;
        }
        return 'Interview Meeting';
    };


    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };


    const handleScheduleMeeting = async () => {
        if (!isFormValid || isScheduling) {
            return;
        }


        setIsScheduling(true);


        try {
            // console.log(profiles);


            const dateTimeString = `${meetingForm.meetingDate}T${meetingForm.meetingTime}:00`;
            const istOffset = '+05:30';
            const isoDateTime = `${dateTimeString}${istOffset}`;


            console.log('Meeting time (IST):', dateTimeString);
            console.log('ISO with IST offset:', isoDateTime);
            console.log('Full profile object:', profile);
            console.log('applicant_id value:', profile.applicant_id);
            console.log('applicant_id type:', typeof profile.applicant_id);


            const meetingData = {
                organizer_email: meetingForm.interviewerEmail,
                subject: getMeetingTitle(),
                attendees: [meetingForm.interviewerEmail, meetingForm.candidateEmail],
                start_time: isoDateTime,
                search_id: selectedSearchHistory.search_id,
                applicant_id: profile.applicant_id,
                duration_minutes: 60,
            };


            const response = await fetch(`http://localhost:8000/api/schedule-meeting`, {
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
                console.error('Meeting scheduling error:', errorData);
                showNotification(errorData.message || 'Failed to schedule meeting. Please try again.', 'error');
                return;
            }


            const result = await response.json();
            console.log('Meeting scheduled:', result);


            if (result.id) {
                sessionStorage.setItem('meetingid', result.id);
                console.log('Meeting ID saved in sessionStorage:', result.id);
            }


            const updatedProfile = {
                ...profile,
                timeline: {
                    ...profile.timeline,
                    invite: {
                        completed: true,
                        date: meetingForm.meetingDate,
                        time: meetingForm.meetingTime,
                        meetingId: result.id,
                        interviewerEmail: meetingForm.interviewerEmail,
                        candidateEmail: meetingForm.candidateEmail,
                        meetingTitle: getMeetingTitle(),
                    },
                },
                status: 'awaiting',
            };


            const currentProfiles = useStore.getState().atsProfiles;
            const updatedProfiles = currentProfiles.map((p) =>
                p.id === profile.id ? updatedProfile : p
            );
            setAtsProfiles(updatedProfiles);
            setSelectedAtsProfile(updatedProfile);


            showNotification('Meeting scheduled successfully!', 'success');


            // ✅ Trigger refresh from database if onUpdate callback exists
            if (onUpdate) {
                await onUpdate();
            }


            setActiveTimelineStep('awaiting');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            showNotification('Failed to schedule meeting. Please check your connection and try again.', 'error');
        } finally {
            setIsScheduling(false);
        }
    };



    return (
        <div className="space-y-4 relative">
            {/* Floating Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed top-4 right-4 z-50 max-w-md"
                    >
                        <div
                            className={`flex items-start gap-3 p-4 rounded-lg shadow-2xl border-2 ${notification.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <IconCheck className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <IconAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p
                                    className={`font-medium ${notification.type === 'success'
                                        ? 'text-green-800 dark:text-green-300'
                                        : 'text-red-800 dark:text-red-300'
                                        }`}
                                >
                                    {notification.type === 'success' ? 'Success' : 'Error'}
                                </p>
                                <p
                                    className={`text-sm mt-1 ${notification.type === 'success'
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-red-700 dark:text-red-400'
                                        }`}
                                >
                                    {notification.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setNotification(null)}
                                className={`${notification.type === 'success'
                                    ? 'text-green-600 hover:text-green-800 dark:text-green-400'
                                    : 'text-red-600 hover:text-red-800 dark:text-red-400'
                                    }`}
                            >
                                <IconX className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule Interview Meeting
            </h3>


            {timeline.invite.completed ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 dark:border-green-700 rounded-xl p-6 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-500 rounded-full p-2">
                            <IconSend className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-green-800 dark:text-green-300 text-lg">
                                Meeting Invitation Sent
                            </h4>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                All participants have been notified
                            </p>
                        </div>
                    </div>


                    <div className="space-y-3 bg-white/50 dark:bg-black/20 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Meeting Title
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {getMeetingTitle()}
                                </p>
                            </div>
                            {/* <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Meeting ID
                                </p>
                                <p className="text-sm font-mono text-gray-900 dark:text-white">
                                    {timeline.invite.meetingId || 'N/A'}
                                </p>
                            </div> */}
                        </div>


                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Participants
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Interviewer:</span>{' '}
                                        {timeline.invite.interviewerEmail || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Candidate:</span>{' '}
                                        {timeline.invite.candidateEmail || profile.email}
                                    </span>
                                </div>
                            </div>
                        </div>


                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Date
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(timeline.invite.date).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Time
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {timeline.invite.time} IST
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg p-6">
                    {/* Meeting Title Preview */}
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meeting Title</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {getMeetingTitle()}
                        </p>
                    </div>


                    {/* Form */}
                    <div className="space-y-4">
                        {/* Candidate Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Candidate Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={meetingForm.candidateEmail}
                                onChange={(e) =>
                                    setMeetingForm({ ...meetingForm, candidateEmail: e.target.value })
                                }
                                placeholder="candidate@example.com"
                                disabled={isScheduling}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>


                        {/* Interviewer Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Interviewer Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={meetingForm.interviewerEmail}
                                onChange={(e) =>
                                    setMeetingForm({ ...meetingForm, interviewerEmail: e.target.value })
                                }
                                placeholder="interviewer@example.com"
                                disabled={isScheduling}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>


                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Date Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meeting Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={meetingForm.meetingDate}
                                    onChange={(e) =>
                                        setMeetingForm({ ...meetingForm, meetingDate: e.target.value })
                                    }
                                    min={new Date().toISOString().split('T')[0]}
                                    disabled={isScheduling}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>


                            {/* Time Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meeting Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={meetingForm.meetingTime}
                                    onChange={(e) =>
                                        setMeetingForm({ ...meetingForm, meetingTime: e.target.value })
                                    }
                                    disabled={isScheduling}
                                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>


                        {/* Schedule Button */}
                        <button
                            onClick={handleScheduleMeeting}
                            disabled={!isFormValid || isScheduling}
                            className={`w-full px-6 py-3 rounded-lg font-medium transition-all mt-6 flex items-center justify-center gap-2 ${isFormValid && !isScheduling
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 dark:bg-neutral-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isScheduling ? (
                                <>
                                    <IconLoader2 className="h-5 w-5 animate-spin" />
                                    <span>Scheduling Meeting...</span>
                                </>
                            ) : (
                                <span>{isFormValid ? 'Schedule Meeting' : 'Please fill all required fields'}</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default InviteStep;

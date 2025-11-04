import React, { useEffect, useState } from 'react';
import { IconX, IconCheck, IconClock, IconVideo, IconBrain, IconNotes, IconClipboardText } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import InviteStep from './Interview/InviteStep';
import AwaitingStep from './Interview/InterviewNotes';
import MeetingStep from './TimelineSteps/MeetingStep';
import AnalysisStep from './Interview/AnalysisStep';


const ProfileModal = ({ isOpen, onClose, profile, activeStep, setActiveStep }) => {
    const [loading, setLoading] = useState(false);
    const [updatedProfile, setUpdatedProfile] = useState(profile);


    useEffect(() => {
        // console.log(profile);
        if (isOpen && profile) {
            fetchApplicantTracking();
        }
    }, [isOpen, profile]);


    const fetchApplicantTracking = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/applicant-tracking/${profile.applicant_id}`,
                {
                    credentials: 'include',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }
            );


            if (response.ok) {
                const trackingData = await response.json();


                // Update profile with database information
                const mergedProfile = {
                    ...profile,
                    timeline: {
                        ...profile.timeline,
                        invite: {
                            ...profile.timeline.invite,
                            completed: trackingData.meeting_status === 'scheduled' || trackingData.meeting_status === 'completed',
                            ...(trackingData.meeting_info && {
                                date: trackingData.meeting_info.start_time?.split('T')[0],
                                time: trackingData.meeting_info.start_time?.split('T')[1]?.substring(0, 5),
                                meetingId: trackingData.meeting_info.meeting_id,
                                interviewerEmail: trackingData.meeting_info.interviewer_email,
                                candidateEmail: trackingData.meeting_info.candidate_email,
                                meetingTitle: trackingData.meeting_info.subject,
                                meetingLink: trackingData.meeting_info.meeting_link,
                            }),
                        },
                        awaiting: {
                            ...profile.timeline.awaiting,
                            completed: trackingData.meeting_status === 'completed',
                        },
                        meeting: {
                            ...profile.timeline.meeting,
                            completed: trackingData.transcription !== null,
                        },
                        analysis: {
                            ...profile.timeline.analysis,
                            completed: trackingData.ai_analysis !== null,
                        },
                    },
                    meeting_status: trackingData.meeting_status,
                    transcription: trackingData.transcription,
                    ai_analysis: trackingData.ai_analysis,
                };


                setUpdatedProfile(mergedProfile);


                // Auto-set active step based on status
                if (trackingData.ai_analysis) {
                    setActiveStep('analysis');
                } else if (trackingData.meeting_status === 'scheduled') {
                    setActiveStep('awaiting');
                } else {
                    setActiveStep('invite');
                }


            }
        } catch (error) {
            console.error('Error fetching applicant tracking:', error);
        } finally {
            setLoading(false);
        }
    };


    if (!updatedProfile) return null;

    // Determine if meeting is scheduled (not in 'invite' status)
    const isMeetingScheduled = updatedProfile.meeting_status && updatedProfile.meeting_status !== 'invite';

    const timelineSteps = [
        {
            id: 'invite',
            label: isMeetingScheduled ? 'Status' : 'Status',
            icon: IconCheck,
            color: 'blue'
        },
        {
            id: 'awaiting',
            label: 'Interview Notes',
            icon: IconNotes,
            color: 'yellow'
        },
        {
            id: 'analysis',
            label: 'Overall Feedback',
            icon: IconClipboardText,
            color: 'green'
        },
    ];



    const renderStepContent = () => {
        switch (activeStep) {
            case 'invite':
                return <InviteStep profile={updatedProfile} onUpdate={fetchApplicantTracking} />;
            case 'awaiting':
                return <AwaitingStep profile={updatedProfile} />;
            case 'analysis':
                return <AnalysisStep profile={updatedProfile} />;
            default:
                return null;
        }
    };



    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />


                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {updatedProfile.avatar}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{updatedProfile.name}</h2>
                                            <p className="text-blue-100">{updatedProfile.position}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-sm text-blue-100">
                                                    Added: {new Date(updatedProfile.appliedDate).toLocaleDateString()}
                                                </span>
                                                <span className="px-2 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
                                                    {(updatedProfile.score * 100).toFixed(0)}% Match
                                                </span>
                                                {loading && (
                                                    <span className="text-xs text-blue-100 animate-pulse">
                                                        Loading status...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                    >
                                        <IconX className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>


                            {/* Content */}
                            <div className="flex h-[calc(90vh-150px)]">
                                {/* Timeline Sidebar */}
                                <div className="w-64 bg-gray-50 dark:bg-neutral-900 p-6 border-r border-gray-200 dark:border-neutral-700 overflow-y-auto">
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                        Interview Process
                                    </h3>
                                    <div className="space-y-2">
                                        {timelineSteps.map((step, index) => {
                                            const isCompleted = updatedProfile.timeline[step.id]?.completed;
                                            const isActive = activeStep === step.id;
                                            const Icon = step.icon;


                                            return (
                                                <button
                                                    key={step.id}
                                                    onClick={() => setActiveStep(step.id)}
                                                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${isActive
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                                        : 'hover:bg-gray-100 dark:hover:bg-neutral-800'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`h-8 w-8 rounded-full flex items-center justify-center ${isCompleted
                                                                ? `bg-${step.color}-500 text-white`
                                                                : 'bg-gray-300 dark:bg-neutral-700 text-gray-600 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        {index < timelineSteps.length - 1 && (
                                                            <div
                                                                className={`w-0.5 h-8 mt-1 ${isCompleted
                                                                    ? `bg-${step.color}-500`
                                                                    : 'bg-gray-300 dark:bg-neutral-700'
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <p
                                                            className={`text-sm font-medium ${isActive
                                                                ? 'text-blue-900 dark:text-blue-300'
                                                                : 'text-gray-900 dark:text-white'
                                                                }`}
                                                        >
                                                            {step.label}
                                                        </p>
                                                        {/* {isCompleted && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                Completed
                                                            </p>
                                                        )} */}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>


                                {/* Content Area */}
                                <div className="flex-1 p-8 overflow-y-auto">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {renderStepContent()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};


export default ProfileModal;

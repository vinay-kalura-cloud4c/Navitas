import React, { useState } from 'react';
import { IconX, IconDownload, IconLoader, IconFileText } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import useStore from '../../store/useStore';

const InterviewNotesModal = ({ interview, profile, onClose }) => {
    const [transcription, setTranscription] = useState(interview.transcription || null);
    const [loading, setLoading] = useState(false);
    const selectedSearchHistory = useStore((state) => state.selectedSearchHistory);

    const fetchTranscription = async () => {
        setLoading(true);

        const meetingId = interview.meetingId;
        const applicantId = profile.applicant_id;
        const jobDescription = selectedSearchHistory?.job_description || '';

        if (!jobDescription) {
            toast.error('Job description not found. Please select a search first.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/api/get-transcription?applicant_id=${applicantId}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        id: meetingId,
                        job_description: jobDescription,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();

                if (data.status === 'completed') {
                    setTranscription(data.transcript);
                    toast.success('Transcription fetched successfully!');
                } else if (data.status === 'in_progress') {
                    toast.error(data.message);
                } else if (data.status === 'no_transcript') {
                    toast.error(data.message);
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail?.error || 'Failed to fetch transcription');
            }
        } catch (error) {
            console.error('Error fetching transcription:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
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
                <Toaster position="top-right" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Interview {interview.roundNumber} Notes
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(interview.date).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })} at {interview.time}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {!transcription && (
                                <button
                                    onClick={fetchTranscription}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${loading
                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <IconLoader className="h-4 w-4 animate-spin" />
                                            Fetching...
                                        </>
                                    ) : (
                                        <>
                                            <IconDownload className="h-4 w-4" />
                                            Fetch Notes
                                        </>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <IconX className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {transcription ? (
                            <div className="space-y-4">
                                {/* Interview Details Card */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                        Interview Details
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            <strong>Interviewer:</strong> {interview.interviewerEmail}
                                        </div>
                                        <div>
                                            <strong>Candidate:</strong> {interview.candidateEmail}
                                        </div>
                                    </div>
                                </div>

                                {/* Transcription */}
                                <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            Meeting Transcription
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
                                            {transcription.length} characters
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {transcription}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <IconFileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                    No notes available yet
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Click "Fetch Notes" to retrieve the interview transcription
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InterviewNotesModal;

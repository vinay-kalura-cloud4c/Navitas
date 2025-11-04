import React from 'react';
import { IconX, IconCalendar, IconClock, IconMail } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewInfoModal = ({ interview, onClose }) => {
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
                    className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Interview {interview.roundNumber} Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
                        >
                            <IconX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <IconCalendar className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(interview.date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <IconClock className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</p>
                                <p className="text-gray-900 dark:text-white">{interview.time} IST</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <IconMail className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interviewer</p>
                                <p className="text-gray-900 dark:text-white">{interview.interviewerEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <IconMail className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidate</p>
                                <p className="text-gray-900 dark:text-white">{interview.candidateEmail}</p>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InterviewInfoModal;

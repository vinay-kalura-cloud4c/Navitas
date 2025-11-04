import React, { useState } from 'react';
import { IconInfoCircle, IconCheck, IconClock, IconFileText } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import InterviewNotesModal from './InterviewNotesModal';

const InterviewNoteTile = ({ interview, profile }) => {
    const [showNotes, setShowNotes] = useState(false);

    const getStatusIcon = () => {
        switch (interview.status) {
            case 'completed':
                return <IconCheck className="h-4 w-4 text-green-500" />;
            case 'scheduled':
                return <IconClock className="h-4 w-4 text-blue-500" />;
            default:
                return null;
        }
    };

    const hasNotes = interview.transcription || interview.notes;

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getStatusIcon()}
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                                Interview {interview.roundNumber}
                            </span>
                            {hasNotes && (
                                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                    Notes Available
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasNotes && (
                            <IconFileText className="h-5 w-5 text-blue-500" />
                        )}
                        <button
                            onClick={() => setShowNotes(true)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded transition-colors"
                            title="View interview notes"
                        >
                            <IconInfoCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Quick info preview */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                    <span>
                        {new Date(interview.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                    <span>{interview.time}</span>
                    {interview.status === 'completed' && (
                        <span className="text-green-600 dark:text-green-400">Completed</span>
                    )}
                </div>
            </motion.div>

            {showNotes && (
                <InterviewNotesModal
                    interview={interview}
                    profile={profile}
                    onClose={() => setShowNotes(false)}
                />
            )}
        </>
    );
};

export default InterviewNoteTile;

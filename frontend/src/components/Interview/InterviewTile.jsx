import React, { useState } from 'react';
import { IconInfoCircle, IconCheck, IconClock } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import InterviewInfoModal from './InterviewInfoModal';

const InterviewTile = ({ interview, isSelected, onSelect }) => {
    const [showInfo, setShowInfo] = useState(false);

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

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:border-gray-300'
                    }`}
                onClick={onSelect}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className="font-medium text-gray-900 dark:text-white">
                            Interview {interview.roundNumber}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInfo(true);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded"
                    >
                        <IconInfoCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            </motion.div>

            {showInfo && (
                <InterviewInfoModal
                    interview={interview}
                    onClose={() => setShowInfo(false)}
                />
            )}
        </>
    );
};

export default InterviewTile;

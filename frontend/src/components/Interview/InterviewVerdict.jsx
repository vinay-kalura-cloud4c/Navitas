import React from 'react';
import { IconThumbUp, IconThumbDown, IconMinus } from '@tabler/icons-react';

const InterviewVerdict = ({ interview }) => {
    const getVerdictDisplay = () => {
        switch (interview.verdict) {
            case 'selected':
                return {
                    icon: <IconThumbUp className="h-4 w-4" />,
                    text: 'Selected',
                    color: 'green',
                    bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-500',
                    textClass: 'text-green-700 dark:text-green-300'
                };
            case 'rejected':
                return {
                    icon: <IconThumbDown className="h-4 w-4" />,
                    text: 'Rejected',
                    color: 'red',
                    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-500',
                    textClass: 'text-red-700 dark:text-red-300'
                };
            case 'pending':
                return {
                    icon: <IconMinus className="h-4 w-4" />,
                    text: 'Pending',
                    color: 'yellow',
                    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500',
                    textClass: 'text-yellow-700 dark:text-yellow-300'
                };
            default:
                return null;
        }
    };

    const verdictData = getVerdictDisplay();

    if (!verdictData) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                No verdict available
            </div>
        );
    }

    return (
        <div className={`border-2 rounded-lg p-4 ${verdictData.bgClass}`}>
            <div className="flex flex-col items-center gap-4">

                <h4 className={`text-lg font-bold ${verdictData.textClass}`}>
                    {verdictData.text}
                </h4>

                {interview.feedback && (
                    <div className="w-full mt-4">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Feedback
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {interview.feedback}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewVerdict;

import React from 'react';
import { IconVideo } from '@tabler/icons-react';

const MeetingStep = ({ profile }) => {
    const timeline = profile.timeline;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Meeting Completed</h3>

            {timeline.meeting.completed ? (
                <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <IconVideo className="h-5 w-5 text-purple-600" />
                            <span className="font-medium text-purple-800 dark:text-purple-300">
                                Interview Completed
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Date: {new Date(timeline.meeting.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Duration: {timeline.meeting.duration}
                        </p>
                    </div>

                    {timeline.meeting.transcription && (
                        <div className="bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Transcription</h4>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Download
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {timeline.meeting.transcription}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">Meeting not yet completed...</p>
            )}
        </div>
    );
};

export default MeetingStep;

import React from 'react';
import { IconBrain } from '@tabler/icons-react';

const AnalysisStep = ({ profile }) => {
    const timeline = profile.timeline;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Overall Feedback / Observation</h3>

            {timeline.analysis.completed ? (
                <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <IconBrain className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800 dark:text-green-300">
                                Analysis Complete
                            </span>
                        </div>

                        {/* Scores */}
                        <div className="space-y-3 mb-4">
                            {/* Technical Skills */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Technical Skills
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {timeline.analysis.technicalScore}/10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(timeline.analysis.technicalScore / 10) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Communication */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Communication
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {timeline.analysis.communicationScore}/10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${(timeline.analysis.communicationScore / 10) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Culture Fit */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Culture Fit
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {timeline.analysis.cultureFit}/10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{ width: `${(timeline.analysis.cultureFit / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-white dark:bg-neutral-700 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Recommendation
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                                {timeline.analysis.recommendation}
                            </p>
                        </div>

                        {/* Summary */}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-medium mb-1">Summary</p>
                            <p>{timeline.analysis.summary}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg p-6 text-center">
                    <IconBrain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                        AI analysis will be available after the interview is completed
                    </p>
                </div>
            )}
        </div>
    );
};

export default AnalysisStep;

import React from 'react';
import useStore from '../../store/useStore';
import InterviewNoteTile from './InterviewNoteTile';

const AwaitingStep = ({ profile }) => {
    const { interviews } = useStore();

    // Filter interviews for current profile
    const profileInterviews = interviews.filter(
        interview => interview.applicantId === profile.applicant_id
    );

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interview Notes
            </h3>

            <div className="space-y-3">
                {profileInterviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No interviews scheduled yet</p>
                        <p className="text-sm mt-2">Interview notes will appear here once interviews are conducted</p>
                    </div>
                ) : (
                    profileInterviews.map((interview) => (
                        <InterviewNoteTile
                            key={interview.id}
                            interview={interview}
                            profile={profile}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AwaitingStep;

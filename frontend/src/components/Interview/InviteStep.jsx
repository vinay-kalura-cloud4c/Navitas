import React, { useEffect } from 'react';
import { IconPlus } from '@tabler/icons-react';
import useStore from '../../store/useStore';
import InterviewTile from './InterviewTile';
import InterviewVerdict from './InterviewVerdict';
import ScheduleInterviewModal from './ScheduleInterviewModal';

const InviteStep = ({ profile, onUpdate }) => {
    const {
        interviews,
        selectedInterview,
        setSelectedInterview,
        isSchedulingModalOpen,
        setIsSchedulingModalOpen,
        setInterviews
    } = useStore();

    // Sync interviews from profile data to Zustand store on component mount
    useEffect(() => {
        if (profile && profile.meeting_info && Array.isArray(profile.meeting_info)) {
            // Parse meeting_info array and convert to interview objects
            const parsedInterviews = profile.meeting_info.map((meetingInfoStr, index) => {
                try {
                    const meetingData = JSON.parse(meetingInfoStr);

                    // Determine status based on profile data
                    let status = 'scheduled';
                    if (profile.meeting_status === 'completed') {
                        status = 'completed';
                    } else if (profile.meeting_status === 'scheduled') {
                        status = 'scheduled';
                    }

                    // Parse start_time to extract date and time
                    const startTime = new Date(meetingData.start_time);
                    const meetingDate = startTime.toISOString().split('T')[0];
                    const meetingTime = startTime.toTimeString().slice(0, 5);

                    return {
                        id: meetingData.meeting_id,
                        applicantId: profile.applicant_id,
                        roundNumber: index + 1,
                        date: meetingDate,
                        time: meetingTime,
                        meetingId: meetingData.meeting_id,
                        status: status,
                        verdict: 'pending', // Default to pending, can be updated later
                        interviewerEmail: meetingData.interviewer_email,
                        candidateEmail: meetingData.candidate_email,
                        subject: meetingData.subject,
                        meetingLink: meetingData.meeting_link,
                        webLink: meetingData.web_link,
                        durationMinutes: meetingData.duration_minutes,
                        scheduledAt: meetingData.scheduled_at,
                        transcription: profile.transcription || null,
                        aiAnalysis: profile.ai_analysis || null,
                    };
                } catch (error) {
                    console.error('Error parsing meeting info:', error);
                    return null;
                }
            }).filter(interview => interview !== null); // Filter out any failed parses

            // Update the store with parsed interviews for this applicant
            // First, remove any existing interviews for this applicant
            const otherInterviews = interviews.filter(
                interview => interview.applicantId !== profile.applicant_id
            );

            // Then add the new parsed interviews
            setInterviews([...otherInterviews, ...parsedInterviews]);
        }
    }, [profile, profile.applicant_id, profile.meeting_info, setInterviews]); // Re-run when profile changes

    // Filter interviews for current profile
    const profileInterviews = interviews.filter(
        interview => interview.applicantId === profile.applicant_id
    );

    const handleScheduleNew = () => {
        setSelectedInterview(null);
        setIsSchedulingModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsSchedulingModalOpen(false);
    };

    const handleSuccess = async () => {
        // Refresh data if needed
        if (onUpdate) {
            await onUpdate();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Interview Rounds
                </h3>
                {/* <button
                    onClick={handleScheduleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <IconPlus className="h-4 w-4" />
                    Schedule New
                </button> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Left: Interview Tiles */}
                <div className="space-y-3">
                    {profileInterviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No interviews scheduled yet
                        </div>
                    ) : (
                        profileInterviews.map((interview) => (
                            <InterviewTile
                                key={interview.id}
                                interview={interview}
                                isSelected={selectedInterview?.id === interview.id}
                                onSelect={() => setSelectedInterview(interview)}
                            />
                        ))
                    )}
                </div>

                {/* Right: Verdict Panel */}
                <div>
                    {selectedInterview ? (
                        <InterviewVerdict interview={selectedInterview} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">

                        </div>
                    )}
                </div>
            </div>

            {/* Conditionally render the modal */}
            {isSchedulingModalOpen && (
                <ScheduleInterviewModal
                    profile={profile}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default InviteStep;

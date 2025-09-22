import React, { useState, useEffect } from 'react'
import DateTimePicker from './ui/DateTimePicker'
import QuestionModal from './ui/QuestionModal'
import TranscriptModal from './ui/TranscriptModal'
import useStore from '../store/useStore'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_DEV || 'https://127.0.0.1:8000';

const SavedProfileListItem = ({
  profile,
  onRemove,
  invitationChecked,
  onInvitationChange,
  selectedDateTime,
  onDateTimeChange,
  emailAddress,
  onEmailAddressChange,
  status,
  onStatusChange,
  isAuthenticated,
  onAuthRequired
}) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);

  // Auto-load questions when component mounts
  useEffect(() => {
    const loadQuestionsOnMount = async () => {
      // Check if questions are already cached
      const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');

      if (savedQuestions[profile.id]) {
        // Questions already exist, mark as loaded
        setQuestionsLoaded(true);
        return;
      }

      // No cached questions, generate them automatically
      await generateInterviewQuestions();
    };

    loadQuestionsOnMount();
  }, [profile.id]); // Only run when profile.id changes

  const secureApiCall = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers
      }
    });

    if (response.status === 401) {
      onAuthRequired?.(); // Notify parent that auth is required
      throw new Error('Authentication required');
    }

    return response;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Invite Sent':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Awaiting Result':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  };

  // Generate interview questions (auto-called on mount)
  const generateInterviewQuestions = async () => {
    setLoading(true);
    setQuestionsError(null);

    try {
      // Get the job description from selectedSearchHistory in the Zustand store
      const { selectedSearchHistory } = useStore.getState();

      // Extract job description from selectedSearchHistory or provide a fallback
      const jobDescription = selectedSearchHistory?.job_description ||
        selectedSearchHistory?.search_query ||
        "General interview for the position";

      const response = await fetch(`${BACKEND_URL}/api/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          profile_summary: profile.full_summary || profile.short_summary || profile.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Save questions to localStorage
      const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');
      const questionsToStore = typeof data.questions === 'string'
        ? data.questions
        : JSON.stringify(data.questions);

      savedQuestions[profile.id] = questionsToStore;
      localStorage.setItem('interviewQuestions', JSON.stringify(savedQuestions));

      setQuestionsLoaded(true);
      console.log(`Questions auto-loaded for ${profile.name}`);

    } catch (error) {
      console.error('Error generating interview questions:', error);
      setQuestionsError(error.message);
      // Don't show alert for auto-loading failures, just log the error
    } finally {
      setLoading(false);
    }
  };

  // Schedule meeting with authentication check
  const scheduleMeeting = async () => {
    // Get values from the Zustand store
    const { meetingSubject, durationMinutes, additionalEmail } = useStore.getState();

    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (!selectedDateTime) {
      alert('Please select a date and time for the meeting.');
      return;
    }

    setMeetingLoading(true);

    try {
      const meetingData = {
        organizer_email: "vinay.kalura@cloud4c.com",
        subject: meetingSubject || `Interview for ${profile.name}`,
        attendees: ["vinay.kalura@cloud4c.com"],
        start_time: selectedDateTime,
        duration_minutes: durationMinutes || 60
      };

      // Add additional email if provided
      if (additionalEmail && additionalEmail.trim() !== '') {
        meetingData.attendees.push(additionalEmail);
      }

      const response = await secureApiCall(`${BACKEND_URL}/schedule-meeting`, {
        method: 'POST',
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Meeting scheduled:', result);

      // Store the meeting id in session storage
      if (result.id) {
        sessionStorage.setItem('meetingid', result.id);
        console.log('Meeting ID saved in sessionStorage:', sessionStorage.getItem('meetingid'));
        console.log('Meeting ID value:', result.id);
      } else {
        console.warn('No meeting ID found in the response');
      }

      alert('Meeting scheduled successfully!');
      onStatusChange(profile.id, 'Invite Sent');

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      if (error.message !== 'Authentication required') {
        alert('Failed to schedule meeting. Please try again.');
      }
    } finally {
      setMeetingLoading(false);
    }
  };

  // Send email with authentication check
  const sendEmail = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (!emailAddress) {
      alert('Please enter an email address.');
      return;
    }

    try {
      const emailData = {
        to_recipients: [emailAddress],
        subject: `Interview Invitation - ${profile.name}`,
        body: `Hello ${profile.name},\n\nWe would like to invite you for an interview. Please let us know your availability.\n\nBest regards,\nHR Team`,
        cc_recipients: []
      };

      const response = await secureApiCall(`${BACKEND_URL}/send-email`, {
        method: 'POST',
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Email sent successfully!');
      onStatusChange(profile.id, 'Invite Sent');

    } catch (error) {
      console.error('Error sending email:', error);
      if (error.message !== 'Authentication required') {
        alert('Failed to send email. Please try again.');
      }
    }
  };

  // Get transcript with authentication check
  const getTranscript = async (meetingId) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    // Check if transcript data is already in session storage
    const storageKey = `transcript_data_${meetingId}`;
    const cachedData = sessionStorage.getItem(storageKey);

    if (cachedData) {
      console.log('Loading transcript data from session storage');
      const parsedData = JSON.parse(cachedData);
      setCurrentTranscript(parsedData.transcript);
      setAiSummary(parsedData.aiSummary);
      setShowTranscript(true);
      return parsedData;
    }

    try {
      // Get job description from Zustand store for transcript analysis
      const { selectedSearchHistory } = useStore.getState();
      const jobDescription = selectedSearchHistory?.job_description ||
        selectedSearchHistory?.search_query ||
        "General interview position";

      const response = await secureApiCall(`${BACKEND_URL}/get-transcription`, {
        method: 'POST',
        body: JSON.stringify({
          organizer: "me",
          id: meetingId,
          job_description: jobDescription,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const transcript = result.transcript;

      const aiSummaryContent = result.ai_summary?.content ||
        result.ai_summary?.message?.content ||
        result.ai_summary ||
        '';

      const transcriptData = {
        transcript: transcript,
        aiSummary: aiSummaryContent,
        timestamp: new Date().toISOString(),
        meetingId: meetingId
      };

      sessionStorage.setItem(storageKey, JSON.stringify(transcriptData));
      console.log('Transcript data stored in session storage');

      setCurrentTranscript(transcript);
      setAiSummary(aiSummaryContent);
      setShowTranscript(true);

      return transcriptData;

    } catch (error) {
      console.error('Error getting transcript:', error);
      if (error.message !== 'Authentication required') {
        alert('Failed to get transcript. Please try again.');
      }
    }
  };

  const handleTranscriptClick = async () => {
    const meetingId = 'MSpmNWM3ZTM3MS0xOWUwLTQzY2MtYmVmMi0xYTM4YWZjYTBkMTAqMCoqMTk6bWVldGluZ19aRFE1TUdaa1l6RXRZakJsTkMwME9Ua3hMV0kwWWpBdE4yRXpOamxqT1RBMU56VTNAdGhyZWFkLnYy';
    await getTranscript(meetingId);
  };

  const getStoredQuestions = () => {
    const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');
    return savedQuestions[profile.id];
  };

  const hasStoredQuestions = !!getStoredQuestions();

  // Get questions status for display
  const getQuestionsStatus = () => {
    if (loading) return { text: 'Loading Questions...', color: 'bg-yellow-500 text-white', disabled: true };
    if (questionsError) return { text: 'Questions Failed', color: 'bg-red-500 text-white', disabled: false };
    if (questionsLoaded || hasStoredQuestions) return { text: 'View Questions', color: 'bg-green-600 hover:bg-green-700 text-white', disabled: false };
    return { text: 'Questions Loading...', color: 'bg-gray-400 text-white', disabled: true };
  };

  const questionsStatus = getQuestionsStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {profile.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 overflow-hidden">
            {(profile.full_summary || profile.short_summary || '').length > 120
              ? `${(profile.full_summary || profile.short_summary || '').substring(0, 120)}...`
              : (profile.full_summary || profile.short_summary || 'No summary available')
            }
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">
              Score: {profile.score || 'N/A'}
            </span>
            {profile.link && (
              <a
                href={profile.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Profile
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(profile.id, e.target.value)}
            className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getStatusColor(status)}`}
          >
            <option value="Under Review">Under Review</option>
            <option value="Invite Sent">Invite Sent</option>
            <option value="Awaiting Result">Awaiting Result</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block lg:hidden">Email Address</label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => onEmailAddressChange(profile.id, e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-2"
          />

          {/* Auto-loaded Questions Button */}
          <button
            onClick={() => {
              if (questionsError) {
                // Retry loading questions if there was an error
                generateInterviewQuestions();
              } else if (questionsLoaded || hasStoredQuestions) {
                // Show questions if they're loaded
                setShowQuestions(true);
              }
            }}
            disabled={questionsStatus.disabled}
            className={`w-full mb-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${questionsStatus.color}`}
          >
            {questionsStatus.text}
          </button>

          {/* Optional error message */}
          {questionsError && (
            <p className="text-xs text-red-600 mt-1">
              Click to retry loading questions
            </p>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Invitation</label>
          <input
            type="checkbox"
            checked={invitationChecked}
            onChange={(e) => onInvitationChange(profile.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block lg:hidden">Meeting Time</label>
          <DateTimePicker
            value={selectedDateTime}
            onChange={(dateTime) => onDateTimeChange(profile.id, dateTime)}
            className="w-full mb-2"
          />
          <button
            onClick={scheduleMeeting}
            disabled={meetingLoading || !selectedDateTime}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${!isAuthenticated
              ? 'text-green-700 bg-green-50 border border-green-300 hover:bg-green-100'
              : 'text-white bg-green-600 hover:bg-green-700'
              } ${(!selectedDateTime || meetingLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {meetingLoading ? 'Scheduling...' : !isAuthenticated ? '🔒 Schedule (Login Required)' : 'Schedule Meeting'}
          </button>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Transcript</label>
          <button
            onClick={handleTranscriptClick}
            className={`px-3 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAuthenticated
              ? 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
              : 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
              }`}
          >
            {!isAuthenticated ? '🔒 Transcript' : 'Transcript'}
          </button>
        </div>

        <div className="lg:col-span-1 flex justify-center">
          <button
            onClick={() => onRemove(profile.id)}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Remove
          </button>
        </div>
      </div>

      {showTranscript && (
        <TranscriptModal
          transcript={currentTranscript}
          aiSummary={aiSummary}
          onClose={() => setShowTranscript(false)}
        />
      )}

      {showQuestions && (
        <QuestionModal
          questions={getStoredQuestions()}
          onClose={() => setShowQuestions(false)}
        />
      )}
    </div>
  );
};

export default SavedProfileListItem;

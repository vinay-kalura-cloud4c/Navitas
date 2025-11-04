import React, { useState, useEffect } from 'react'
import DateTimePicker from './ui/DateTimePicker'
import QuestionModal from './ui/QuestionModal'
import TranscriptModal from './ui/TranscriptModal'
import useStore from '../store/useStore'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_DEV || 'https://127.0.0.1:8000';

// Error Display Component
const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  const parseError = (errorData) => {
    // Handle the specific API error structure you're receiving
    if (errorData?.detail?.error) {
      const errorMessage = errorData.detail.error;

      // Check for specific Graph API errors
      if (errorMessage.includes('MailboxNotEnabledForRESTAPI')) {
        return {
          type: 'mailbox_error',
          title: 'Mailbox Not Available',
          message: 'The user\'s mailbox is not enabled for API access. This could be because:',
          suggestions: [
            'The mailbox is hosted on-premises (not in Microsoft 365)',
            'The user account is inactive or soft-deleted',
            'The account needs to be properly configured for Graph API access',
            'Try using a different user account with proper Microsoft 365 licensing'
          ]
        };
      }

      // Handle other API errors
      if (errorMessage.includes('APIError')) {
        const codeMatch = errorMessage.match(/Code: (\d+)/);
        const code = codeMatch ? codeMatch[1] : 'Unknown';

        return {
          type: 'api_error',
          title: `API Error (${code})`,
          message: 'There was an issue with the Microsoft Graph API request.',
          suggestions: [
            'Check if the user has proper permissions',
            'Verify the OAuth token is valid and not expired',
            'Ensure the user account is properly configured'
          ]
        };
      }
    }

    // Handle HTTP errors
    if (typeof errorData === 'string' && errorData.includes('HTTP error')) {
      const statusMatch = errorData.match(/status: (\d+)/);
      const status = statusMatch ? statusMatch[1] : 'Unknown';

      return {
        type: 'http_error',
        title: `Network Error (${status})`,
        message: 'Failed to connect to the server.',
        suggestions: [
          'Check your internet connection',
          'The server might be temporarily unavailable',
          'Try again in a few moments'
        ]
      };
    }

    // Fallback for unknown errors
    return {
      type: 'unknown_error',
      title: 'Something went wrong',
      message: typeof errorData === 'string' ? errorData : 'An unexpected error occurred.',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the issue persists'
      ]
    };
  };

  const parsedError = parseError(error);

  const getErrorColor = (type) => {
    switch (type) {
      case 'mailbox_error':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'api_error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'http_error':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'mailbox_error':
        return '⚠️';
      case 'api_error':
        return '❌';
      case 'http_error':
        return '🌐';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`mb-4 p-4 border rounded-lg ${getErrorColor(parsedError.type)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-xl">{getErrorIcon(parsedError.type)}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{parsedError.title}</h4>
            <p className="text-sm mb-2">{parsedError.message}</p>

            {parsedError.suggestions && parsedError.suggestions.length > 0 && (
              <div className="text-xs">
                <p className="font-medium mb-1">Possible solutions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {parsedError.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

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
  onStatusChange
}) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);

  // New error states
  const [meetingError, setMeetingError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [transcriptError, setTranscriptError] = useState(null);

  useEffect(() => {
    const loadQuestionsOnMount = async () => {
      const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');

      if (savedQuestions[profile.id]) {
        setQuestionsLoaded(true);
        return;
      }
      await generateInterviewQuestions();
    };

    loadQuestionsOnMount();
  }, [profile.id]);

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

  const generateInterviewQuestions = async () => {
    setLoading(true);
    setQuestionsError(null);

    try {
      const { selectedSearchHistory } = useStore.getState();

      const jobDescription = selectedSearchHistory?.job_description ||
        selectedSearchHistory?.search_query ||
        "General interview for the position";

      const response = await fetch(`${BACKEND_URL}/api/generate-questions`, {
        method: 'POST',
        credentials: 'include',
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
    } finally {
      setLoading(false);
    }
  };

  // Enhanced scheduleMeeting with better error handling
  const scheduleMeeting = async () => {
    const { meetingSubject, durationMinutes, additionalEmail } = useStore.getState();

    if (!selectedDateTime) {
      setMeetingError('Please select a date and time for the meeting.');
      return;
    }

    setMeetingLoading(true);
    setMeetingError(null); // Clear previous errors

    try {
      const meetingData = {
        organizer_email: "vinay.kalura@cloud4c.com",
        subject: meetingSubject || `Interview for ${profile.name}`,
        attendees: ["vinay.kalura@cloud4c.com"],
        start_time: selectedDateTime,
        duration_minutes: durationMinutes || 60
      };

      if (additionalEmail && additionalEmail.trim() !== '') {
        meetingData.attendees.push(additionalEmail);
      }

      const response = await fetch(`${BACKEND_URL}/api/schedule-meeting`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Meeting scheduling error:', errorData);
        setMeetingError(errorData);
        return;
      }

      const result = await response.json();
      console.log('Meeting scheduled:', result);

      if (result.id) {
        sessionStorage.setItem('meetingid', result.id);
        console.log('Meeting ID saved in sessionStorage:', sessionStorage.getItem('meetingid'));
        console.log('Meeting ID value:', result.id);
      } else {
        console.warn('No meeting ID found in the response');
      }

      // Show success message instead of alert
      onStatusChange(profile.id, 'Invite Sent');

      // You could add a success toast here instead of alert
      alert('Meeting scheduled successfully!');

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setMeetingError(error.message || 'Failed to schedule meeting. Please try again.');
    } finally {
      setMeetingLoading(false);
    }
  };

  // Enhanced sendEmail with better error handling
  const sendEmail = async () => {
    if (!emailAddress) {
      setEmailError('Please enter an email address.');
      return;
    }

    setEmailError(null); // Clear previous errors

    try {
      const emailData = {
        to_recipients: [emailAddress],
        subject: `Interview Invitation - ${profile.name}`,
        body: `Hello ${profile.name},\n\nWe would like to invite you for an interview. Please let us know your availability.\n\nBest regards,\nHR Team`,
        cc_recipients: []
      };

      const response = await fetch(`${BACKEND_URL}/send-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setEmailError(errorData);
        return;
      }

      alert('Email sent successfully!');
      onStatusChange(profile.id, 'Invite Sent');

    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error.message || 'Failed to send email. Please try again.');
    }
  };

  // Enhanced getTranscript with better error handling
  const getTranscript = async (meetingId) => {
    setTranscriptError(null); // Clear previous errors

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
      const { selectedSearchHistory } = useStore.getState();
      const jobDescription = selectedSearchHistory?.job_description ||
        selectedSearchHistory?.search_query ||
        "General interview position";

      const response = await fetch(`${BACKEND_URL}/get-transcription`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          organizer: "me",
          id: meetingId,
          job_description: jobDescription,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setTranscriptError(errorData);
        return;
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
      setTranscriptError(error.message || 'Failed to get transcript. Please try again.');
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

  const getQuestionsStatus = () => {
    if (loading) return { text: 'Loading Questions...', color: 'bg-yellow-500 text-white', disabled: true };
    if (questionsError) return { text: 'Questions Failed', color: 'bg-red-500 text-white', disabled: false };
    if (questionsLoaded || hasStoredQuestions) return { text: 'View Questions', color: 'bg-green-600 hover:bg-green-700 text-white', disabled: false };
    return { text: 'Questions Loading...', color: 'bg-gray-400 text-white', disabled: true };
  };

  const questionsStatus = getQuestionsStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      {/* Error displays */}
      <ErrorAlert
        error={meetingError}
        onClose={() => setMeetingError(null)}
      />
      <ErrorAlert
        error={emailError}
        onClose={() => setEmailError(null)}
      />
      <ErrorAlert
        error={transcriptError}
        onClose={() => setTranscriptError(null)}
      />

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

          <button
            onClick={() => {
              if (questionsError) {
                generateInterviewQuestions();
              } else if (questionsLoaded || hasStoredQuestions) {
                setShowQuestions(true);
              }
            }}
            disabled={questionsStatus.disabled}
            className={`w-full mb-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${questionsStatus.color}`}
          >
            {questionsStatus.text}
          </button>

          {questionsError && (
            <p className="text-xs text-red-600 mt-1">
              Click to retry loading questions
            </p>
          )}

          <button
            onClick={sendEmail}
            disabled={!emailAddress}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!emailAddress ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500' : 'text-white bg-blue-600 hover:bg-blue-700'}`}
          >
            Send Email
          </button>
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
            disabled={!selectedDateTime || meetingLoading}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-green-600 hover:bg-green-700 ${(!selectedDateTime || meetingLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {meetingLoading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Transcript</label>
          <button
            onClick={handleTranscriptClick}
            className="px-3 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100"
          >
            Transcript
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

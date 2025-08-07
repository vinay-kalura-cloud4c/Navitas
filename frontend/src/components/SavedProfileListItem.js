import React, { useState, useEffect } from 'react'
import DateTimePicker from './ui/DateTimePicker'
import QuestionModal from './ui/QuestionModal'
import { PublicClientApplication } from '@azure/msal-browser'
import TranscriptModal from './ui/TranscriptModal'

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || "c97dc8fe-26ae-40a9-8681-906ebd65211b",
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID || "512ec501-cb12-46d1-bbef-7f52f8ad2df8"}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI || "http://localhost:3001"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

const loginRequest = {
  scopes: [
    "https://graph.microsoft.com/Calendars.ReadWrite",
    "https://graph.microsoft.com/OnlineMeetings.ReadWrite",
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/Mail.Send",
    "https://graph.microsoft.com/OnlineMeetingTranscript.Read.All"
  ],
  prompt: "select_account"
};

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const SavedProfileListItem = ({
  profile,
  onRemove,
  emailChecked,
  onEmailChange,
  invitationChecked,
  onInvitationChange,
  selectedDateTime,
  onDateTimeChange,
  emailAddress,
  onEmailAddressChange,
  status,
  onStatusChange,
  onTranscriptClick
}) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [msalInitialized, setMsalInitialized] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false); // ✅ Add transcript modal state
  const [currentTranscript, setCurrentTranscript] = useState(''); // ✅ Add 
  const [aiSummary, setAiSummary] = useState(''); // ✅ Add AI summary state  
  // Initialize MSAL and check authentication status
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        // ✅ Initialize MSAL before any other operations
        await msalInstance.initialize();
        setMsalInitialized(true);
        console.log('MSAL initialized successfully');

        // Check if user is already logged in
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          // User already has an active session
          await acquireTokenSilently();
        }

        // Check backend authentication status
        await checkAuthStatus();
      } catch (error) {
        console.error('MSAL initialization failed:', error);
      }
    };

    initializeMsal();
  }, []);

  // Acquire token silently for existing sessions
  const acquireTokenSilently = async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) return;

      const silentRequest = {
        ...loginRequest,
        account: accounts[0]
      };

      const response = await msalInstance.acquireTokenSilent(silentRequest);

      // Send token to backend
      await sendTokenToBackend(response.accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Silent token acquisition failed:', error);
      // This is expected if user needs to re-authenticate
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth-status`);
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  // Send token to backend helper
  const sendTokenToBackend = async (accessToken) => {
    const response = await fetch(`${BACKEND_URL}/set-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: JSON.stringify({ access_token: accessToken })
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with backend');
    }

    return response;
  };

  // Handle login with proper initialization check
  const handleLogin = async () => {
    if (!msalInitialized) {
      console.error('MSAL not initialized yet');
      alert('Authentication system is still loading. Please try again in a moment.');
      return;
    }

    setAuthLoading(true);
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const accessToken = loginResponse.accessToken;

      // Send token to Python backend
      const res = await sendTokenToBackend(accessToken);
      console.log('Token sent to backend:', res);
      setIsAuthenticated(true);
      console.log('Authentication successful');

    } catch (error) {
      console.error('Login failed:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!msalInitialized) {
      console.error('MSAL not initialized');
      return;
    }

    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0]
        });
      }

      await fetch(`${BACKEND_URL}/logout`, { method: 'POST' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Rest of your component methods remain the same...
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
      setIsAuthenticated(false);
      alert('Session expired. Please login again.');
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

  // Generate interview questions (doesn't require authentication)
  const generateInterviewQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: profile.job_description,
          profile_summary: profile.full_summary
        })
      });

      if (!response.ok) {
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
      setShowQuestions(true);

    } catch (error) {
      console.error('Error generating interview questions:', error);
      alert('Failed to generate interview questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Schedule meeting with authentication
  const scheduleMeeting = async () => {
    if (!isAuthenticated) {
      alert('Please login first to schedule meetings.');
      return;
    }

    if (!selectedDateTime) {
      alert('Please select a date and time for the meeting.');
      return;
    }

    setMeetingLoading(true);
    try {
      const meetingData = {
        organizer_email: "vinay.kalura@cloud4c.com",  // ✅ Added missing field - use "me" for authenticated user
        subject: `Interview for ${profile.name}`,
        attendees: emailAddress ? [emailAddress] : [],
        start_time: selectedDateTime,
        duration_minutes: 60
      };

      const response = await secureApiCall(`${BACKEND_URL}/schedule-meeting`, {
        method: 'POST',
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Meeting scheduled:', result);
      alert('Meeting scheduled successfully!');

      // Update status
      onStatusChange(profile.id, 'Invite Sent');

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setMeetingLoading(false);
    }
  };

  // Send email with authentication
  const sendEmail = async () => {
    if (!isAuthenticated) {
      alert('Please login first to send emails.');
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
      alert('Failed to send email. Please try again.');
    }
  };

  // Get transcript with authentication
  // Get transcript with authentication
  const getTranscript = async (meetingId) => {
    if (!isAuthenticated) {
      alert('Please login first to access transcripts.');
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
      const response = await secureApiCall(`${BACKEND_URL}/get-transcription`, {
        method: 'POST',
        body: JSON.stringify({
          organizer: "me",
          id: meetingId,
          job_description: profile.job_description,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const transcript = result.transcript;

      // ✅ Extract AI summary content from the nested object structure
      const aiSummaryContent = result.ai_summary?.content ||
        result.ai_summary?.message?.content ||
        result.ai_summary ||
        '';

      // ✅ Create data object to store in session storage
      const transcriptData = {
        transcript: transcript,
        aiSummary: aiSummaryContent,
        timestamp: new Date().toISOString(), // Optional: for cache expiry
        meetingId: meetingId
      };

      // ✅ Store complete data in session storage
      sessionStorage.setItem(storageKey, JSON.stringify(transcriptData));
      console.log('Transcript data stored in session storage');

      // ✅ Update component state
      setCurrentTranscript(transcript);
      setAiSummary(aiSummaryContent);
      setShowTranscript(true);

      return transcriptData;

    } catch (error) {
      console.error('Error getting transcript:', error);
      alert('Failed to get transcript. Please try again.');
    }
  };


  // ✅ Function to handle transcript button click
  const handleTranscriptClick = async () => {
    // You can either hardcode a meeting ID for testing or get it dynamically
    const meetingId = 'MSpmNWM3ZTM3MS0xOWUwLTQzY2MtYmVmMi0xYTM4YWZjYTBkMTAqMCoqMTk6bWVldGluZ19aRFE1TUdaa1l6RXRZakJsTkMwME9Ua3hMV0kwWWpBdE4yRXpOamxqT1RBMU56VTNAdGhyZWFkLnYy';
    await getTranscript(meetingId);
  };

  const getStoredQuestions = () => {
    const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');
    return savedQuestions[profile.id];
  };

  const hasStoredQuestions = !!getStoredQuestions();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      {/* Authentication Status Bar */}
      <div className="mb-4 p-3 rounded-md bg-gray-50 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${!msalInitialized ? 'bg-yellow-500' :
              isAuthenticated ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
            <span className="text-sm font-medium">
              {!msalInitialized ? 'Initializing...' :
                isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          <div>
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                disabled={authLoading || !msalInitialized}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {authLoading ? 'Logging in...' :
                  !msalInitialized ? 'Please wait...' : 'Login'}
              </button>
            ) : (
              <button
                onClick={handleLogout}
                disabled={!msalInitialized}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rest of your JSX remains the same... */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Profile Info */}
        <div className="lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {profile.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 overflow-hidden">
            {profile.full_summary.length > 120
              ? `${profile.full_summary.substring(0, 120)}...`
              : profile.full_summary
            }
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">
              Score: {profile.score}
            </span>
            <a
              href={profile.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Profile
            </a>
          </div>
        </div>

        {/* Status Column */}
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

        {/* Email Checkbox */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Email</label>
          <input
            type="checkbox"
            checked={emailChecked}
            onChange={(e) => onEmailChange(profile.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>

        {/* Email Address and Actions */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block lg:hidden">Email Address</label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => onEmailAddressChange(profile.id, e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-2"
          />

          {/* Questions Button */}
          <button
            onClick={hasStoredQuestions ? () => setShowQuestions(true) : generateInterviewQuestions}
            disabled={loading}
            className={`w-full mb-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${hasStoredQuestions
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
              }`}
          >
            {loading ? 'Generating...' : hasStoredQuestions ? 'Display Questions' : 'Generate Questions'}
          </button>

          {/* Send Email Button */}
          <button
            onClick={sendEmail}
            disabled={!isAuthenticated || !emailAddress || !msalInitialized}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Email
          </button>
        </div>

        {/* Send Invitation Checkbox */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Invitation</label>
          <input
            type="checkbox"
            checked={invitationChecked}
            onChange={(e) => onInvitationChange(profile.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>

        {/* Date Time Picker and Schedule Button */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block lg:hidden">Meeting Time</label>
          <DateTimePicker
            value={selectedDateTime}
            onChange={(dateTime) => onDateTimeChange(profile.id, dateTime)}
            className="w-full mb-2"
          />

          {/* Schedule Meeting Button */}
          <button
            onClick={scheduleMeeting}
            disabled={!isAuthenticated || meetingLoading || !selectedDateTime || !msalInitialized}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {meetingLoading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </div>

        {/* Transcript Button */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Transcript</label>
          <button
            onClick={handleTranscriptClick} // ✅ Updated click handler
            disabled={!isAuthenticated || !msalInitialized}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Transcript
          </button>
        </div>

        {/* Remove Button */}
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
          transcript={currentTranscript

          }
          aiSummary={aiSummary} // Assuming you have an AI summary in the profile
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

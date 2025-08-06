import React, { useState } from 'react'
import DateTimePicker from './ui/DateTimePicker'
import QuestionModal from './ui/QuestionModal'



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
  }

  // In your React app
  const msalConfig = {
    auth: {
      clientId: "c97dc8fe-26ae-40a9-8681-906ebd65211b",
      authority: "https://login.microsoftonline.com/512ec501-cb12-46d1-bbef-7f52f8ad2df8",
      redirectUri: "http://localhost:3001" // Your React app URL
    }
  };

  const loginRequest = {
    scopes: ["https://graph.microsoft.com/Calendar.ReadWrite",
      "https://graph.microsoft.com/OnlineMeetings.ReadWrite"]
  };

  // User clicks login button
  const handleLogin = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const accessToken = loginResponse.accessToken;

      // Send token to your Python backend
      const response = await fetch('http://127.0.0.1:8000/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken })
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };


  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateInterviewQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/generate-questions', {
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
      console.log('Generated questions data:', data); // Debug log

      // Save questions to localStorage
      const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');

      // Make sure we're storing the questions as a string
      const questionsToStore = typeof data.questions === 'string'
        ? data.questions
        : JSON.stringify(data.questions);

      savedQuestions[profile.id] = questionsToStore;
      localStorage.setItem('interviewQuestions', JSON.stringify(savedQuestions));

      // Show questions modal
      setShowQuestions(true);

    } catch (error) {
      console.error('Error generating interview questions:', error);
      alert('Failed to generate interview questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStoredQuestions = () => {
    const savedQuestions = JSON.parse(localStorage.getItem('interviewQuestions') || '{}');
    const questions = savedQuestions[profile.id];
    console.log('Retrieved questions:', questions); // Debug log
    return questions;
  };

  const hasStoredQuestions = !!getStoredQuestions();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
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
          <div className="w-full">
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
        </div>

        {/* Email Checkbox */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">
            Email
          </label>
          <input
            type="checkbox"
            checked={emailChecked}
            onChange={(e) => onEmailChange(profile.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>

        {/* Email Address Field */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block lg:hidden">
            Email Address
          </label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => onEmailAddressChange(profile.id, e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={hasStoredQuestions ? () => setShowQuestions(true) : generateInterviewQuestions}
            disabled={loading}
            className={`w-full mt-3 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${hasStoredQuestions
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
              }`}
          >
            {loading ? 'Generating...' : hasStoredQuestions ? 'Display Questions' : 'Generate Questions'}
          </button>
        </div>

        {/* Send Invitation Link Checkbox */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">
            Invitation
          </label>
          <input
            type="checkbox"
            checked={invitationChecked}
            onChange={(e) => onInvitationChange(profile.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>

        {/* Date Time Picker */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block lg:hidden">
            Meeting Time
          </label>
          <DateTimePicker
            value={selectedDateTime}
            onChange={(dateTime) => onDateTimeChange(profile.id, dateTime)}
            className="w-full"
          />
        </div>

        {/* Transcript Button */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2 lg:hidden">Transcript</label>
          <button
            onClick={() => onTranscriptClick(profile.id)}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

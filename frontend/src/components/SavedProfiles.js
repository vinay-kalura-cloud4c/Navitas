import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import SavedProfileListItem from './SavedProfileListItem'
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar"
import { IconHome, IconBookmark, IconSearch } from "@tabler/icons-react"
import { useSearchCache } from '../contexts/SearchCacheContext'

function SavedProfiles({ onNavigate, onNewSearch, hasSearchResults }) {
  const [savedProfiles, setSavedProfiles] = useState([])
  const [emailSelections, setEmailSelections] = useState({})
  const [invitationSelections, setInvitationSelections] = useState({})
  const [dateTimes, setDateTimes] = useState({})
  const [emailAddresses, setEmailAddresses] = useState({})
  const [meetingSubject, setMeetingSubject] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [additionalEmail, setAdditionalEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileStatuses, setProfileStatuses] = useState({})
  const [transcriptPopup, setTranscriptPopup] = useState({ visible: false, profileId: null })

  const { currentQuery, isCacheValid } = useSearchCache()

  useEffect(() => {
    // Load saved profiles from localStorage
    const saved = localStorage.getItem('savedProfiles')
    if (saved) {
      const profiles = JSON.parse(saved)
      setSavedProfiles(profiles)

      // Initialize default date-times for each profile (1 hour from now)
      const defaultDateTime = new Date()
      defaultDateTime.setHours(defaultDateTime.getHours() + 1)
      const initialDateTimes = {}
      const initialStatuses = {}
      profiles.forEach(profile => {
        initialDateTimes[profile.id] = defaultDateTime.toISOString()
        // Initialize with "Under Review" status
        initialStatuses[profile.id] = 'Under Review'
      })
      setDateTimes(initialDateTimes)
      setProfileStatuses(initialStatuses)
    }
  }, [])

  const clearAllSaved = () => {
    localStorage.removeItem('savedProfiles')
    setSavedProfiles([])
    setEmailSelections({})
    setInvitationSelections({})
    setDateTimes({})
    setEmailAddresses({})
    setProfileStatuses({})
    setMeetingSubject('')
    setDurationMinutes(30)
    setAdditionalEmail('')
    setTranscriptPopup({ visible: false, profileId: null })
  }

  const removeSavedProfile = (profileId) => {
    const updated = savedProfiles.filter(p => p.id !== profileId)
    setSavedProfiles(updated)
    localStorage.setItem('savedProfiles', JSON.stringify(updated))

    // Clean up associated selections and date-times
    const newEmailSelections = { ...emailSelections }
    const newInvitationSelections = { ...invitationSelections }
    const newDateTimes = { ...dateTimes }
    const newEmailAddresses = { ...emailAddresses }
    const newProfileStatuses = { ...profileStatuses }

    delete newEmailSelections[profileId]
    delete newInvitationSelections[profileId]
    delete newDateTimes[profileId]
    delete newEmailAddresses[profileId]
    delete newProfileStatuses[profileId]

    setEmailSelections(newEmailSelections)
    setInvitationSelections(newInvitationSelections)
    setDateTimes(newDateTimes)
    setEmailAddresses(newEmailAddresses)
    setProfileStatuses(newProfileStatuses)
  }

  const handleEmailChange = (profileId, checked) => {
    setEmailSelections(prev => ({
      ...prev,
      [profileId]: checked
    }))
  }

  const handleInvitationChange = (profileId, checked) => {
    setInvitationSelections(prev => ({
      ...prev,
      [profileId]: checked
    }))
  }

  const handleDateTimeChange = (profileId, dateTime) => {
    setDateTimes(prev => ({
      ...prev,
      [profileId]: dateTime
    }))
  }

  const handleEmailAddressChange = (profileId, email) => {
    setEmailAddresses(prev => ({
      ...prev,
      [profileId]: email
    }))
  }

  const handleStatusChange = (profileId, status) => {
    setProfileStatuses(prev => ({
      ...prev,
      [profileId]: status
    }))
  }

  const handleTranscriptClick = (profileId) => {
    setTranscriptPopup({ visible: true, profileId })
  }

  const handleTranscriptClose = () => {
    setTranscriptPopup({ visible: false, profileId: null })
  }

  const handleSubmit = async () => {
    // Validation: Check required fields
    if (!meetingSubject.trim()) {
      alert('Please provide a meeting subject.')
      return
    }

    // Prepare data for submission
    const selectedProfiles = savedProfiles.filter(profile =>
      emailSelections[profile.id] || invitationSelections[profile.id]
    ).map(profile => ({
      ...profile,
      sendEmail: emailSelections[profile.id] || false,
      sendInvitation: invitationSelections[profile.id] || false,
      meetingDateTime: dateTimes[profile.id],
      emailAddress: emailAddresses[profile.id] || ''
    }))

    // Validation: Check if email address is provided for profiles that need email
    const profilesNeedingEmail = selectedProfiles.filter(p => p.sendEmail)
    const missingEmails = profilesNeedingEmail.filter(p => !p.emailAddress.trim())

    if (missingEmails.length > 0) {
      alert(`Please provide email addresses for ${missingEmails.length} profile(s) that have email selected.`)
      return
    }

    if (selectedProfiles.length === 0) {
      alert('Please select at least one profile.')
      return
    }

    setIsSubmitting(true)

    try {
      const meetingResults = []
      let successCount = 0
      let errorCount = 0

      // Process each profile separately with their individual datetime
      for (const profile of selectedProfiles) {
        try {
          // Collect attendees for this profile
          const attendeeEmails = []

          // Add profile's email if provided
          if (profile.emailAddress && profile.emailAddress.trim()) {
            attendeeEmails.push(profile.emailAddress.trim())
          }

          // Add additional email for all meetings if provided
          if (additionalEmail.trim()) {
            attendeeEmails.push(additionalEmail.trim())
          }

          if (attendeeEmails.length === 0) {
            console.warn(`Skipping profile ${profile.name} - no email addresses provided`)
            continue
          }

          // Use the profile's specific datetime or fallback to 1 hour from now
          let startTime = new Date()
          startTime.setHours(startTime.getHours() + 1)

          if (profile.meetingDateTime) {
            startTime = new Date(profile.meetingDateTime)
          }

          // Prepare the API payload for this profile
          const payload = {
            subject: `${meetingSubject.trim()} - ${profile.name}`,
            attendees: attendeeEmails,
            start_time: startTime.toISOString(),
            duration_minutes: durationMinutes
          }

          console.log(`Scheduling meeting for profile ${profile.name}:`, payload)

          const response = await fetch('/schedule-meeting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
          }

          const result = await response.json()
          console.log(`Meeting scheduled successfully for ${profile.name}:`, result)

          // Update status to "Invite Sent" after successful meeting scheduling
          setProfileStatuses(prev => ({
            ...prev,
            [profile.id]: 'Invite Sent'
          }))

          meetingResults.push({
            profile: profile.name,
            success: true,
            result
          })
          successCount++

        } catch (error) {
          console.error(`Error scheduling meeting for ${profile.name}:`, error)
          meetingResults.push({
            profile: profile.name,
            success: false,
            error: error.message
          })
          errorCount++
        }
      }

      // Show summary results
      if (successCount > 0) {
        alert(`Successfully scheduled ${successCount} meeting(s)!${errorCount > 0 ? ` ${errorCount} failed.` : ''}`)

        // Reset form after successful submissions
        setEmailSelections({})
        setInvitationSelections({})
        setEmailAddresses({})
        setAdditionalEmail('')
        setMeetingSubject('')
      } else {
        alert(`Failed to schedule any meetings. Please check the console for details.`)
      }

    } catch (error) {
      console.error('Error in meeting scheduling process:', error)
      alert(`Failed to schedule meetings: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasSelections = Object.values(emailSelections).some(Boolean) ||
    Object.values(invitationSelections).some(Boolean)

  const links = [
    {
      label: "Home",
      href: "#",
      icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNewSearch ? onNewSearch() : onNavigate('landing')
    },
    {
      label: hasSearchResults && currentQuery && isCacheValid(currentQuery) ? "Back to Results" : "New Search",
      href: "#",
      icon: <IconSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => hasSearchResults && currentQuery && isCacheValid(currentQuery) ? onNavigate('results') : (onNewSearch ? onNewSearch() : onNavigate('landing'))
    },
    {
      label: "Saved Profiles",
      href: "#",
      icon: <IconBookmark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('saved')
    }
  ]

  return (
    <div className="min-h-screen flex">
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo/Title Section */}
            <div className="flex px-4 py-4">
              <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                AX UI
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div key={idx} onClick={link.onClick} className="cursor-pointer">
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Saved Profiles
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              {savedProfiles.length} saved profiles
            </p>
            {savedProfiles.length > 0 && (
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  onClick={clearAllSaved}
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                >
                  Clear All Saved
                </Button>
              </div>
            )}
          </header>

          {savedProfiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-semibold text-slate-700 mb-2">No saved profiles yet</h2>
              <p className="text-slate-500 mb-6">Start saving profiles from your search results!</p>
              <Button
                onClick={() => onNavigate('landing')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Search
              </Button>
            </div>
          ) : (
            <>
              {/* Meeting Configuration Form */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Meeting Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Subject *
                    </label>
                    <input
                      type="text"
                      value={meetingSubject}
                      onChange={(e) => setMeetingSubject(e.target.value)}
                      placeholder="Team Meeting"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Email (optional)
                    </label>
                    <input
                      type="email"
                      value={additionalEmail}
                      onChange={(e) => setAdditionalEmail(e.target.value)}
                      placeholder="additional@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be added to all meetings</p>
                  </div>
                </div>
              </div>

              {/* Column Headers */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 hidden lg:block">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-3">Profile Information</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-center">Email</div>
                  <div className="col-span-2 text-center">Email Address</div>
                  <div className="col-span-1 text-center">Invitation</div>
                  <div className="col-span-2 text-center">Meeting Time</div>
                  <div className="col-span-1 text-center">Transcript</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
              </div>

              {/* Profile List */}
              <div className="space-y-4 mb-8">
                {savedProfiles.map((profile) => (
                  <SavedProfileListItem
                    key={profile.id}
                    profile={profile}
                    onRemove={removeSavedProfile}
                    emailChecked={emailSelections[profile.id] || false}
                    onEmailChange={handleEmailChange}
                    invitationChecked={invitationSelections[profile.id] || false}
                    onInvitationChange={handleInvitationChange}
                    selectedDateTime={dateTimes[profile.id]}
                    onDateTimeChange={handleDateTimeChange}
                    emailAddress={emailAddresses[profile.id] || ''}
                    onEmailAddressChange={handleEmailAddressChange}
                    status={profileStatuses[profile.id] || 'Under Review'}
                    onStatusChange={handleStatusChange}
                    onTranscriptClick={handleTranscriptClick}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  disabled={!hasSelections || isSubmitting}
                  className={`px-8 py-3 text-lg font-semibold ${hasSelections && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting
                    ? 'Scheduling Meetings...'
                    : hasSelections
                      ? `Schedule ${Object.values(emailSelections).filter(Boolean).length + Object.values(invitationSelections).filter(Boolean).length} Individual Meeting(s)`
                      : 'Select profiles to schedule meetings'
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transcript Popup */}
      {transcriptPopup.visible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleTranscriptClose}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Meeting Transcript
                </h3>
                <button
                  onClick={handleTranscriptClose}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-lg font-medium mb-2">Transcript Not Available</p>
                  <p className="text-sm">
                    Meeting transcripts will be available after the Teams meeting finishes.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleTranscriptClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedProfiles

import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import ExpandableCardDemo from "./expandable-card-demo-standard";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar"
import { IconHome, IconBookmark, IconSearch, IconDashboard } from "@tabler/icons-react"
import useStore from '../store/useStore'

function ProfileResults({ searchQuery, onBackToSearch, onNavigate, onNewSearch }) {
  const profiles = useStore(state => state.profiles)
  const selectedSearchHistory = useStore(state => state.selectedSearchHistory) // Get selected search history

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProfiles, setSelectedProfiles] = useState(new Set())
  const profilesPerPage = 9

  useEffect(() => {
    setCurrentPage(1);
  }, [profiles]);

  const displaySearchQuery = selectedSearchHistory?.job_description || searchQuery
  const isFromHistory = !!selectedSearchHistory

  const handleProfileSelection = (profileId, isSelected) => {
    const newSelection = new Set(selectedProfiles)
    if (isSelected) {
      newSelection.add(profileId)
    } else {
      newSelection.delete(profileId)
    }
    setSelectedProfiles(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedProfiles.size === currentProfiles.length) {
      const newSelection = new Set(selectedProfiles)
      currentProfiles.forEach(profile => newSelection.delete(profile.id))
      setSelectedProfiles(newSelection)
    } else {
      const newSelection = new Set(selectedProfiles)
      currentProfiles.forEach(profile => newSelection.add(profile.id))
      setSelectedProfiles(newSelection)
    }
  }

  const handleSaveSelectedProfiles = async () => {
    if (selectedProfiles.size === 0) {
      alert('Please select at least one profile to save.')
      return
    }

    // You need to have the search_id from your search results
    // This should be available from when you called the /match endpoint
    const searchId = selectedSearchHistory?.search_id; // Adjust based on your state structure

    if (!searchId) {
      alert('Search ID not found. Please perform a new search.')
      return
    }

    try {
      const profilesToSave = profiles.filter(profile =>
        selectedProfiles.has(profile.id)
      )

      const response = await fetch('http://localhost:8000/api/save-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          search_id: searchId,
          job_description: selectedSearchHistory.job_description || searchQuery,
          profiles: profilesToSave
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to save profiles')
      }

      if (result.success) {
        alert(result.message)
        setSelectedProfiles(new Set())
      } else {
        alert('Failed to save profiles. Please try again.')
      }

    } catch (error) {
      console.error('Error saving profiles:', error)
      alert(`Error saving profiles: ${error.message}`)
    }
  }



  const handleBackAction = () => {
    if (isFromHistory) {
      // If viewing from history, go back to dashboard
      onNavigate('dashboard')
    } else {
      // If from new search, go back to search
      onBackToSearch()
    }
  }

  const totalPages = Math.ceil(profiles.length / profilesPerPage)
  const currentProfiles = profiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  )

  const links = [
    {
      label: "Home",
      href: "#",
      icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNewSearch()
    },
    {
      label: "New Search",
      href: "#",
      icon: <IconSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNewSearch()
    },
    {
      label: "Dashboard", // Add dashboard link
      href: "#",
      icon: <IconDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('dashboard')
    },
    {
      label: "Saved Profiles",
      href: "#",
      icon: <IconBookmark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('saved')
    }
  ]

  const currentPageSelectedCount = currentProfiles.filter(profile => selectedProfiles.has(profile.id)).length
  const allCurrentPageSelected = currentPageSelectedCount === currentProfiles.length && currentProfiles.length > 0

  return (
    <div className="min-h-screen flex">
      {/* <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
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
      </Sidebar> */}

      <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={handleBackAction}
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-300"
              >
                ← {isFromHistory ? 'Back to Dashboard' : 'Back to Search'}
              </Button>

              {/* Show additional info if from history */}
              {isFromHistory && selectedSearchHistory && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <span className="text-sm text-blue-700">
                    Historical Search from {new Date(selectedSearchHistory.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Profile Results
            </h1>
            <p className="text-lg text-slate-600">
              Search: "{displaySearchQuery}"
            </p>

            {/* Show search stats if from history */}
            {isFromHistory && selectedSearchHistory && (
              <div className="flex justify-center gap-6 mt-4 text-sm text-slate-600">
                <span>Status: <span className="capitalize font-medium">{selectedSearchHistory.search_status}</span></span>
                <span>Total Matches: <span className="font-medium">{selectedSearchHistory.total_matches}</span></span>
                <span>Previously Shortlisted: <span className="font-medium">{selectedSearchHistory.shortlisted_count}</span></span>
              </div>
            )}
          </header>

          <div className="flex justify-between items-center mb-6">
            <p className="text-lg text-slate-600">
              {profiles.length} profiles found
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={currentProfiles.length === 0}
                />
                <span className="text-sm text-slate-600">
                  Select all on page ({currentPageSelectedCount}/{currentProfiles.length})
                </span>
              </div>

              {selectedProfiles.size > 0 && (
                <Button
                  onClick={handleSaveSelectedProfiles}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Selected ({selectedProfiles.size})
                </Button>
              )}
            </div>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600">No profiles found for this search.</p>
              <Button
                onClick={onNewSearch}
                className="mt-4"
              >
                Try a new search
              </Button>
            </div>
          ) : (
            <>
              <ExpandableCardDemo
                cards={currentProfiles}
                selectedProfiles={selectedProfiles}
                onProfileSelection={handleProfileSelection}
              />

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mb-8 mt-8">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(c => c - 1)}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(c => c + 1)}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileResults

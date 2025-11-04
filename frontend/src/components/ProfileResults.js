import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import ExpandableCardDemo from "./expandable-card-demo-standard";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar"
import { IconHome, IconBookmark, IconSearch, IconDashboard } from "@tabler/icons-react"
import useStore from '../store/useStore'


function ProfileResults({ searchQuery, onBackToSearch, onNavigate, onNewSearch }) {
  const profiles = useStore(state => state.profiles)
  const selectedSearchHistory = useStore(state => state.selectedSearchHistory)

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProfiles, setSelectedProfiles] = useState(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const profilesPerPage = 9


  useEffect(() => {
    setCurrentPage(1);
  }, [profiles]);


  const displaySearchQuery = selectedSearchHistory?.job_description || searchQuery
  const isFromHistory = !!selectedSearchHistory


  // CSV Export Function with Loading State
  const exportToCSV = async () => {
    if (!selectedSearchHistory || !selectedSearchHistory.search_results.top_profiles || selectedSearchHistory.search_results.top_profiles.length === 0) {
      alert('No profiles available to export.')
      return
    }

    // Prevent multiple clicks
    if (isExporting) {
      return
    }

    try {
      setIsExporting(true)

      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 300))

      // Define CSV headers
      const headers = ['Name/Title', 'LinkedIn URL', 'Summary/Snippet', 'Match Score']

      // Convert profiles to CSV rows
      const csvRows = selectedSearchHistory.search_results.top_profiles.map(profile => {
        // Escape double quotes and wrap fields in quotes to handle commas and special characters
        const escapedTitle = `"${(profile.title || profile.name || 'N/A').replace(/"/g, '""')}"`
        const escapedLink = `"${(profile.link || 'N/A').replace(/"/g, '""')}"`
        const escapedSnippet = `"${(profile.snippet || profile.short_summary || 'N/A').replace(/"/g, '""')}"`
        const score = profile.score || 0

        return [escapedTitle, escapedLink, escapedSnippet, score].join(',')
      })

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `talent_search_results_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      URL.revokeObjectURL(url)

      // Small delay before re-enabling button
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }


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

    const searchId = selectedSearchHistory?.search_id;

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
      onNavigate('dashboard')
    } else {
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
      label: "Dashboard",
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

              {isFromHistory && selectedSearchHistory && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <span className="text-sm text-blue-700">
                    Search From {new Date(selectedSearchHistory.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>


            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Profile Results
            </h1>



            {isFromHistory && selectedSearchHistory && (
              <div className="flex justify-center gap-6 mt-4 text-sm text-slate-600">
                {/* <span>Status: <span className="capitalize font-mesdium">{selectedSearchHistory.search_status}</span></span> */}
                <span>Total Matches: <span className="font-medium">{selectedSearchHistory.total_matches}</span></span>
                <span>Previously Shortlisted: <span className="font-medium">{selectedSearchHistory.shortlisted_count}</span></span>
              </div>
            )}
          </header>


          <div className="flex justify-between items-center mb-6">
            <p className="text-lg text-slate-600">
              Search: "{displaySearchQuery}"
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

              {/* Export CSV Button with Loading State */}
              <Button
                onClick={exportToCSV}
                disabled={isExporting}
                className={`
                  px-6 py-2 font-semibold text-sm transition-all duration-200 rounded-lg flex items-center gap-2
                  ${isExporting
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }
                `}
              >
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    Export CSV
                  </>
                )}
              </Button>


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

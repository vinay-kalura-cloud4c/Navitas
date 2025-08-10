import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import ExpandableCardDemo from "./expandable-card-demo-standard";
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar"
import { IconHome, IconBookmark, IconSearch, IconRefresh } from "@tabler/icons-react"
import { useSearchCache } from '../contexts/SearchCacheContext'

function ProfileResults({ searchQuery, onBackToSearch, onNavigate, onNewSearch }) {
  const [profiles, setProfiles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProfiles, setSelectedProfiles] = useState(new Set())
  const profilesPerPage = 9

  const {
    getCachedData,
    isCacheValid,
    isLoading,
    setSearchResults,
    setLoading,
    invalidateCache
  } = useSearchCache()

  // Check if we have cached data on component mount
  useEffect(() => {
    if (!searchQuery) return

    const cachedData = getCachedData(searchQuery)
    if (cachedData) {
      // Use cached data immediately
      setProfiles(cachedData)
      setCurrentPage(1)
      console.log('[ProfileResults] Using cached data for:', searchQuery)
    } else {
      // Fetch fresh data
      fetchSearchResults(searchQuery)
    }
  }, [searchQuery])

  const fetchSearchResults = async (query) => {
    if (!query) return

    console.log('[ProfileResults] Fetching fresh data for:', query)
    setLoading(query, true)

    try {
      const response = await fetch('/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: query })
      })

      if (!response.ok) throw new Error(response.status)

      const data = await response.json()

      // Map API fields to Profile interface
      const mapped = (data.top_profiles || []).map((p, i) => ({
        id: i,
        name: p.title,
        short_summary: p.snippet,
        full_summary: `${p.snippet}`,
        link: p.link,
        score: p.score
      }))

      setProfiles(mapped)
      setCurrentPage(1)
      setSelectedProfiles(new Set()) // Clear selection when new data loads

      // Cache the results
      setSearchResults(query, mapped)

    } catch (err) {
      console.error('[ProfileResults] Fetch error:', err)
      setProfiles([])
      setSearchResults(query, []) // Cache empty results to prevent repeated failures
    }
  }

  const handleRefresh = () => {
    if (searchQuery) {
      invalidateCache(searchQuery)
      setSelectedProfiles(new Set()) // Clear selection on refresh
      fetchSearchResults(searchQuery)
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
      // Deselect all current page profiles
      const newSelection = new Set(selectedProfiles)
      currentProfiles.forEach(profile => newSelection.delete(profile.id))
      setSelectedProfiles(newSelection)
    } else {
      // Select all current page profiles
      const newSelection = new Set(selectedProfiles)
      currentProfiles.forEach(profile => newSelection.add(profile.id))
      setSelectedProfiles(newSelection)
    }
  }

  const handleSaveSelectedProfiles = () => {
    if (selectedProfiles.size === 0) {
      alert('Please select at least one profile to save.')
      return
    }

    // Get existing saved profiles from localStorage
    const existingSaved = JSON.parse(localStorage.getItem('savedProfiles') || '[]')
    const existingSavedIds = new Set(existingSaved.map(profile => profile.id))

    // Filter selected profiles and add job description
    const profilesToSave = profiles
      .filter(profile => selectedProfiles.has(profile.id) && !existingSavedIds.has(profile.id))
      .map(profile => ({
        ...profile,
        job_description: searchQuery
      }))

    if (profilesToSave.length === 0) {
      alert('All selected profiles are already saved!')
      return
    }

    // Save to localStorage
    const updatedSaved = [...existingSaved, ...profilesToSave]
    localStorage.setItem('savedProfiles', JSON.stringify(updatedSaved))

    // Show success message
    alert(`${profilesToSave.length} profile(s) saved successfully!`)

    // Clear selection after saving
    setSelectedProfiles(new Set())
  }

  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  const currentProfiles = profiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

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
      label: "Saved Profiles",
      href: "#",
      icon: <IconBookmark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('saved')
    }
  ]

  const loading = isLoading(searchQuery)
  const currentPageSelectedCount = currentProfiles.filter(profile => selectedProfiles.has(profile.id)).length
  const allCurrentPageSelected = currentPageSelectedCount === currentProfiles.length && currentProfiles.length > 0

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
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={onBackToSearch}
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-300"
              >
                ← Back to Search
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-300 flex items-center gap-2"
                disabled={loading}
              >
                <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Profile Results
            </h1>
            {isCacheValid(searchQuery) && !loading && (
              <p className="text-sm text-green-600 mb-2">
                ✓ Showing cached results
              </p>
            )}
          </header>

          {loading ? (
            <div className="flex items-center justify-center my-12">
              <svg
                className="animate-spin h-12 w-12 text-gray-500"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-lg text-slate-600">
                  {profiles.length} profiles found
                </p>

                {/* Selection Controls */}
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

              {/* Feed the mapped cards into the demo component */}
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

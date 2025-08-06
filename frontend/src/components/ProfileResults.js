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
      fetchSearchResults(searchQuery)
    }
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

  const handleSaveProfile = (profile) => {
    // Get existing saved profiles from localStorage
    const existingSaved = JSON.parse(localStorage.getItem('savedProfiles') || '[]')

    // Check if profile is already saved
    const isAlreadySaved = existingSaved.some(saved => saved.id === profile.id)

    if (!isAlreadySaved) {
      // Create enhanced profile object with job description
      const enhancedProfile = {
        ...profile,
        job_description: searchQuery // Add the job description from searchQuery prop
      }

      const updatedSaved = [...existingSaved, enhancedProfile]
      localStorage.setItem('savedProfiles', JSON.stringify(updatedSaved))
      alert('Profile saved successfully!')
    } else {
      alert('Profile is already saved!')
    }
  }

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
              <p className="text-lg text-slate-600 mb-6">
                {profiles.length} profiles found
              </p>
              {/* feed the mapped cards into the demo component */}
              <ExpandableCardDemo
                cards={currentProfiles}
                onSave={handleSaveProfile}
                showSaveButton={true}
              />

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mb-8">
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
import React, { useState, useCallback, useRef } from 'react'
import InputWithButton from './comp-22'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { StarsBackground } from './core/backgrounds/stars'
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar"
import { IconHome, IconBookmark, IconSearch } from "@tabler/icons-react"
import useStore from '../store/useStore'

export default function LandingPage({ onSearch, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('')
  const setProfiles = useStore(state => state.setProfiles) // ✅ Correct way to access setProfiles
  const [loading, setLoading] = useState(false)
  const isSearchingRef = useRef(false)

  const searchProfiles = useCallback(async (query) => {
    if (isSearchingRef.current || loading) {
      console.log('Search already in progress, skipping...')
      return
    }

    isSearchingRef.current = true
    setLoading(true)

    try {
      console.log('Making API call with query:', query)

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL_DEV}/match`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "job_description": query,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API response received:', data)

      // Map the API response to the expected format for your ProfileResults component
      const mappedProfiles = (data.top_profiles || []).map((profile, index) => ({
        id: index,
        name: profile.title || profile.name || 'Unknown',
        short_summary: profile.snippet || profile.short_summary || '',
        full_summary: profile.snippet || profile.full_summary || '',
        link: profile.link || '',
        score: profile.score || 0,
        platform: profile.platform || 'LinkedIn',
      }))

      setProfiles(mappedProfiles) // Now this will work correctly

      // Pass the search query to navigate to results
      onSearch(query)

    } catch (error) {
      console.error('Error searching profiles:', error)
      alert('Failed to search profiles. Please try again.')
    } finally {
      setLoading(false)
      isSearchingRef.current = false
    }
  }, [onSearch, loading, setProfiles]) // Added setProfiles to dependencies

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (searchQuery.trim() && !loading) {
      searchProfiles(searchQuery)
    }
  }, [searchQuery, loading, searchProfiles])

  const links = [
    {
      label: "Home",
      href: "#",
      icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('landing')
    },
    {
      label: "Search",
      href: "#",
      icon: <IconSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('landing')
    },
    {
      label: "Saved Profiles",
      href: "#",
      icon: <IconBookmark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => onNavigate('saved')
    }
  ]

  return (
    <div className="h-screen flex">
      <Sidebar>
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
      </Sidebar>

      <div className="flex-1 overflow-y-auto">
        <StarsBackground className="min-h-screen">
          <div className="bg-black/40 flex flex-col items-center justify-start p-5 min-h-screen">
            <div className="max-w-4xl w-full text-center animate-fade-in py-8">
              <header className="mb-16 text-white mt-16">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
                  Search. Select. Succeed
                </h1>
              </header>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-20 mt-24">
                <Card className="p-2 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                  <InputWithButton
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    disabled={loading}
                    placeholder={loading ? "Searching..." : "Enter search query"}
                  />
                </Card>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🔍</div>
                    <CardTitle className="text-white text-lg">Advanced Search</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      Find professionals by job title, skills, and experience
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                    <CardTitle className="text-white text-lg">Profile Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      Get detailed insights and match scores for each profile
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🚀</div>
                    <CardTitle className="text-white text-lg">Quick Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      Instant access to relevant professional profiles
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              <footer className="mt-12 w-full text-right text-white/80">
                <a
                  href="https://www.automatonsx.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  Powered by AUTOMATONSX
                </a>
              </footer>
            </div>
          </div>
        </StarsBackground>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Searching profiles...</p>
          </div>
        </div>
      )}
    </div>
  )
}

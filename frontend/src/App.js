import React, { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ProfileResults from './components/ProfileResults'
import SavedProfiles from './components/SavedProfiles'
import Dashboard from './components/dashboard'
import LoginPage from './components/LoginPage'
import AuthService from './components/AuthService'
import { SearchCacheProvider } from './contexts/SearchCacheContext'
import { Sidebar, SidebarBody, SidebarLink } from './components/ui/sidebar'
import { IconSearch, IconDashboard, IconBookmark, IconLogout } from '@tabler/icons-react'
import { motion } from 'framer-motion'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const userData = await AuthService.getCurrentUser()
      setUser(userData?.user)
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await AuthService.logout()
    setUser(null)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentView('results')
  }

  const handleBackToSearch = () => {
    setSearchQuery('')
    setCurrentView('landing')
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  const handleNewSearch = () => {
    setCurrentView('landing')
  }

  // Navigation links
  const links = [
    {
      label: "New Search",
      href: "#",
      icon: <IconSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Dashboard",
      href: "#",
      icon: <IconDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Saved Profiles",
      href: "#",
      icon: <IconBookmark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ]

  const handleSidebarNavigation = (linkLabel) => {
    switch (linkLabel) {
      case "New Search":
        handleNavigate('landing')
        break
      case "Dashboard":
        handleNavigate('dashboard')
        break
      case "Saved Profiles":
        handleNavigate('saved')
        break
      default:
        break
    }
  }

  const isLinkActive = (linkLabel) => {
    switch (linkLabel) {
      case "New Search":
        return currentView === 'landing'
      case "Dashboard":
        return currentView === 'dashboard'
      case "Saved Profiles":
        return currentView === 'saved'
      default:
        return false
    }
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show main app if authenticated
  return (
    <>
      {/* User info and logout */}
      <header style={{
        position: 'fixed',
        top: 0,
        right: 0,
        padding: '16px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, {user.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <SearchCacheProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-neutral-800">
          <Sidebar>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Logo/Brand */}
                <div className="flex items-center gap-2 py-4">
                  <div className="h-7 w-7 bg-blue-600 rounded-md flex-shrink-0" />
                  <motion.span
                    className="font-medium text-neutral-800 dark:text-neutral-200"
                    animate={{ opacity: 1 }}
                  >
                    Talent Search
                  </motion.span>
                </div>

                {/* Navigation Links */}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink
                      key={idx}
                      link={link}
                      onClick={() => handleSidebarNavigation(link.label)}
                      isActive={isLinkActive(link.label)}
                    />
                  ))}
                </div>
              </div>

              {/* User Info at Bottom */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <motion.div
                    className="text-sm text-neutral-700 dark:text-neutral-200 truncate"
                    animate={{ opacity: 1 }}
                  >
                    {user?.name}
                  </motion.div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 transition-colors w-full"
                >
                  <IconLogout className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </SidebarBody>
          </Sidebar>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {currentView === 'landing' && (
              <LandingPage onSearch={handleSearch} onNavigate={handleNavigate} />
            )}
            {currentView === 'results' && (
              <ProfileResults
                searchQuery={searchQuery}
                onBackToSearch={handleBackToSearch}
                onNavigate={handleNavigate}
                onNewSearch={handleNewSearch}
              />
            )}
            {currentView === 'saved' && (
              <SavedProfiles
                onNavigate={handleNavigate}
                onNewSearch={handleNewSearch}
                hasSearchResults={!!searchQuery}
              />
            )}
            {currentView === 'dashboard' && (
              <Dashboard
                onNavigate={handleNavigate}
                onNewSearch={handleNewSearch}
              />
            )}
          </div>
        </div>
      </SearchCacheProvider>
    </>
  )
}

export default App

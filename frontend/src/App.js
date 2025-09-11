import React, { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ProfileResults from './components/ProfileResults'
import SavedProfiles from './components/SavedProfiles'
import LoginPage from './components/LoginPage'
import AuthService from './components/AuthService'
import { SearchCacheProvider } from './contexts/SearchCacheContext'

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
    <SearchCacheProvider>
      <div className="App">
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

        {/* Main app content */}
        <main style={{ paddingTop: '60px' }}>
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
        </main>
      </div>
    </SearchCacheProvider>
  )
}

export default App

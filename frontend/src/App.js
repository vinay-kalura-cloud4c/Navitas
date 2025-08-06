import React, { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ProfileResults from './components/ProfileResults'
import SavedProfiles from './components/SavedProfiles'
import { SearchCacheProvider } from './contexts/SearchCacheContext'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'results', or 'saved'
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentView('results')
  }

  const handleBackToSearch = () => {
    // Only clear search query when explicitly going back to search
    setSearchQuery('')
    setCurrentView('landing')
  }

  const handleNavigate = (view) => {
    // Don't clear search query when navigating between pages
    setCurrentView(view)
  }

  const handleNewSearch = () => {
    // Allow starting a new search from any page
    setCurrentView('landing')
  }

  return (
    <SearchCacheProvider>
      <div className="App">
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
      </div>
    </SearchCacheProvider>
  )
}

export default App
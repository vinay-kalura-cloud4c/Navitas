import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000

const SearchCacheContext = createContext()

// Action types
const CACHE_ACTIONS = {
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_LOADING: 'SET_LOADING',
  INVALIDATE_CACHE: 'INVALIDATE_CACHE'
}

// Initial state
const initialState = {
  cache: {}, // { searchQuery: { data: [], timestamp: number, loading: boolean } }
  currentQuery: null
}

// Cache reducer
function cacheReducer(state, action) {
  switch (action.type) {
    case CACHE_ACTIONS.SET_SEARCH_RESULTS:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.query]: {
            data: action.payload.data,
            timestamp: Date.now(),
            loading: false
          }
        },
        currentQuery: action.payload.query
      }

    case CACHE_ACTIONS.SET_LOADING:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.query]: {
            ...state.cache[action.payload.query],
            loading: action.payload.loading
          }
        },
        currentQuery: action.payload.query
      }

    case CACHE_ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        cache: {},
        currentQuery: null
      }

    case CACHE_ACTIONS.INVALIDATE_CACHE:
      const newCache = { ...state.cache }
      delete newCache[action.payload.query]
      return {
        ...state,
        cache: newCache,
        currentQuery: state.currentQuery === action.payload.query ? null : state.currentQuery
      }

    default:
      return state
  }
}

// Load cache from localStorage
function loadCacheFromStorage() {
  try {
    const cached = localStorage.getItem('searchCache')
    if (cached) {
      const parsedCache = JSON.parse(cached)
      // Filter out expired cache entries
      const validCache = {}
      const now = Date.now()
      
      Object.entries(parsedCache.cache || {}).forEach(([query, data]) => {
        if (data.timestamp && (now - data.timestamp) < CACHE_EXPIRATION_TIME) {
          validCache[query] = { ...data, loading: false }
        }
      })
      
      return {
        cache: validCache,
        currentQuery: parsedCache.currentQuery || null
      }
    }
  } catch (error) {
    console.error('Error loading search cache from storage:', error)
  }
  return initialState
}

// Save cache to localStorage
function saveCacheToStorage(state) {
  try {
    localStorage.setItem('searchCache', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving search cache to storage:', error)
  }
}

export function SearchCacheProvider({ children }) {
  const [state, dispatch] = useReducer(cacheReducer, initialState, loadCacheFromStorage)

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveCacheToStorage(state)
  }, [state])

  // Check if cache is valid for a given query
  const isCacheValid = (query) => {
    const cached = state.cache[query]
    if (!cached || !cached.timestamp) return false
    
    const now = Date.now()
    return (now - cached.timestamp) < CACHE_EXPIRATION_TIME
  }

  // Get cached data for a query
  const getCachedData = (query) => {
    if (isCacheValid(query)) {
      return state.cache[query].data
    }
    return null
  }

  // Check if currently loading
  const isLoading = (query) => {
    return state.cache[query]?.loading || false
  }

  // Set search results
  const setSearchResults = (query, data) => {
    dispatch({
      type: CACHE_ACTIONS.SET_SEARCH_RESULTS,
      payload: { query, data }
    })
  }

  // Set loading state
  const setLoading = (query, loading) => {
    dispatch({
      type: CACHE_ACTIONS.SET_LOADING,
      payload: { query, loading }
    })
  }

  // Clear all cache
  const clearCache = () => {
    dispatch({ type: CACHE_ACTIONS.CLEAR_CACHE })
  }

  // Invalidate specific cache entry
  const invalidateCache = (query) => {
    dispatch({
      type: CACHE_ACTIONS.INVALIDATE_CACHE,
      payload: { query }
    })
  }

  const value = {
    currentQuery: state.currentQuery,
    getCachedData,
    isCacheValid,
    isLoading,
    setSearchResults,
    setLoading,
    clearCache,
    invalidateCache
  }

  return (
    <SearchCacheContext.Provider value={value}>
      {children}
    </SearchCacheContext.Provider>
  )
}

export function useSearchCache() {
  const context = useContext(SearchCacheContext)
  if (!context) {
    throw new Error('useSearchCache must be used within a SearchCacheProvider')
  }
  return context
}

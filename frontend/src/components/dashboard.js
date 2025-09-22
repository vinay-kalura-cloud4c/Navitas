import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';

const Dashboard = ({ onNavigate, onNewSearch }) => {
    const {
        searchHistory,
        setSearchHistory,
        dashboardLoading,
        setDashboardLoading,
        setProfiles,
        setSelectedSearchHistory
    } = useStore();

    useEffect(() => {
        fetchSearchHistory();
    }, []);

    // Updated handleViewResults function in Dashboard.js
    const handleViewResults = async (search) => {
        try {
            const response = await fetch(`http://localhost:8000/api/search-history/${search.search_id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const searchData = data.search;

                // Parse search results and extract profiles
                let profiles = [];
                if (searchData.search_results && searchData.search_results.top_profiles) {
                    profiles = searchData.search_results.top_profiles.map((profile, index) => {
                        // Extract name from title (remove extra text after " - ")
                        const name = profile.title.split(' - ')[0] || profile.title;

                        // Determine platform from link
                        let platform = 'default';
                        if (profile.link.includes('linkedin.com')) {
                            platform = 'linkedin';
                        } else if (profile.link.includes('github.com')) {
                            platform = 'github';
                        } else if (profile.link.includes('indeed.com')) {
                            platform = 'indeed';
                        }

                        return {
                            id: `${search.search_id}_${index}`, // Generate unique ID
                            name: name, // Extract name from title
                            short_summary: profile.snippet || '', // Use snippet as short summary
                            full_summary: profile.snippet || '', // Use same as full summary (since we don't have more detailed info)
                            link: profile.link,
                            score: profile.score,
                            platform: platform // Add platform based on URL
                        };
                    });
                }

                console.log('Transformed profiles:', profiles); // Debug log

                // Set the profiles in the store
                setProfiles(profiles);

                // Store the search history data for reference
                setSelectedSearchHistory(searchData);

                // Navigate to results page
                onNavigate('results');
            }
        } catch (error) {
            console.error('Failed to fetch search details:', error);
            alert('Failed to load search results. Please try again.');
        }
    };

    // New function to handle viewing shortlisted candidates
    // Updated function in Dashboard.js
    const handleViewShortlisted = (search) => {
        try {
            // Set the selected search history in the store
            setSelectedSearchHistory(search);

            // Navigate to saved profiles page to show shortlisted candidates
            onNavigate('saved');
        } catch (error) {
            console.error('Failed to navigate to shortlisted candidates:', error);
            alert('Failed to load shortlisted candidates. Please try again.');
        }
    };


    const fetchSearchHistory = async () => {
        setDashboardLoading(true);
        try {
            // Updated to use cookies instead of Authorization header
            const response = await fetch('http://localhost:8000/api/search-history', {
                method: 'GET',
                credentials: 'include', // This ensures cookies are sent with the request
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSearchHistory(data.searches || []);
        } catch (error) {
            console.error('Failed to fetch search history:', error);
            // Mock data for development
            setSearchHistory([
                {
                    search_id: 'cd450b95-b3ba-4ef1-b369-0b3a2caa3e2a',
                    job_description: 'Software Engineer Hyderabad',
                    total_matches: 10,
                    shortlisted_count: 3,
                    search_status: 'completed',
                    created_at: '2025-09-17T11:21:14.969094'
                },
                {
                    search_id: 'cd450b95-b3ba-4ef1-b369-0b3a2caa3e2b',
                    job_description: 'React Developer Mumbai',
                    total_matches: 15,
                    shortlisted_count: 5,
                    search_status: 'completed',
                    created_at: '2025-09-16T10:15:30.123456'
                },
                {
                    search_id: 'cd450b95-b3ba-4ef1-b369-0b3a2caa3e2c',
                    job_description: 'Full Stack Developer Bangalore',
                    total_matches: 8,
                    shortlisted_count: 2,
                    search_status: 'pending',
                    created_at: '2025-09-15T14:30:45.789012'
                }
            ]);
        } finally {
            setDashboardLoading(false);
        }
    };

    const handleDeleteSearch = async (searchId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/search-history/${searchId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh the search history
                fetchSearchHistory();
            }
        } catch (error) {
            console.error('Failed to delete search:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (dashboardLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Loading search history...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Search History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Track your talent search activities and results
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Search
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {searchHistory.length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Total Searches</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600">
                        {searchHistory.filter(s => s.search_status === 'completed').length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Completed</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-blue-600">
                        {searchHistory.reduce((sum, s) => sum + (s.total_matches || 0), 0)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Total Matches</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600">
                        {searchHistory.reduce((sum, s) => sum + (s.shortlisted_count || 0), 0)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Shortlisted</div>
                </div>
            </div>

            {/* Search History Table/Tile View */}
            {searchHistory.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                        No search history found
                    </div>
                    <div className="text-gray-500 dark:text-gray-500">
                        Start searching to see your history here
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {/* <div className="col-span-1">Status</div> */}
                        <div className="col-span-5">Job Description</div>
                        <div className="col-span-2">Created Date</div>
                        <div className="col-span-1 text-center">Matches</div>
                        <div className="col-span-1 text-center">Shortlisted</div>
                        <div className="col-span-3 text-center">Actions</div>
                    </div>

                    {/* Table Body - Tile Rows */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {searchHistory.map((search) => (
                            <SearchTile
                                key={search.search_id}
                                search={search}
                                formatDate={formatDate}
                                onViewResults={handleViewResults}
                                onViewShortlisted={handleViewShortlisted}
                                onDelete={handleDeleteSearch}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchTile = ({ search, formatDate, onViewResults, onViewShortlisted, onDelete }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return {
                    color: 'text-green-700 dark:text-green-400',
                    bg: 'bg-green-100 dark:bg-green-900/20',
                    icon: '✓'
                };
            case 'pending':
                return {
                    color: 'text-yellow-700 dark:text-yellow-400',
                    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
                    icon: '⏳'
                };
            case 'failed':
                return {
                    color: 'text-red-700 dark:text-red-400',
                    bg: 'bg-red-100 dark:bg-red-900/20',
                    icon: '✗'
                };
            default:
                return {
                    color: 'text-gray-700 dark:text-gray-400',
                    bg: 'bg-gray-100 dark:bg-gray-900/20',
                    icon: '◦'
                };
        }
    };

    const statusConfig = getStatusConfig(search.search_status);

    return (
        <div className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            {/* Status */}
            {/* <div className="col-span-1 flex items-center">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1`}>
                    <span>{statusConfig.icon}</span>
                    <span className="capitalize hidden sm:inline">{search.search_status}</span>
                </div>
            </div> */}

            {/* Job Description */}
            <div className="col-span-5 flex items-center">
                <div className="truncate">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                        {search.job_description}
                    </div>
                    {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {search.search_id.slice(0, 8)}...
                    </div> */}
                </div>
            </div>

            {/* Created Date */}
            <div className="col-span-2 flex items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(search.created_at)}
                </div>
            </div>

            {/* Total Matches */}
            <div className="col-span-1 flex items-center justify-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {search.total_matches || 0}
                </div>
            </div>

            {/* Shortlisted Count */}
            <div className="col-span-1 flex items-center justify-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {search.shortlisted_count || 0}
                </div>
            </div>

            {/* Actions */}
            <div className="col-span-3 flex items-center justify-center gap-2">
                <button
                    onClick={() => onViewResults(search)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded font-medium transition-colors"
                >
                    View Results
                </button>
                <button
                    onClick={() => onViewShortlisted(search)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded font-medium transition-colors"
                    disabled={!search.shortlisted_count || search.shortlisted_count === 0}
                >
                    Shortlisted
                </button>
                <button
                    onClick={() => onDelete(search.search_id)}
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400 text-xs py-1.5 px-3 rounded font-medium transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default Dashboard;

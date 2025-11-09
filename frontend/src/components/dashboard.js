import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';


const Dashboard = ({ onNavigate, onNewSearch }) => {
    const {
        searchHistory,
        setSearchHistory,
        dashboardLoading,
        setDashboardLoading,
        setProfiles,
        setSelectedSearchHistory,
        setAtsProfiles
    } = useStore();


    const [viewMode, setViewMode] = useState('normal'); // 'normal' or 'job_requisition'


    useEffect(() => {
        fetchSearchHistory();
    }, [viewMode]);


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


                let profiles = [];
                if (searchData.search_results && searchData.search_results.top_profiles) {
                    profiles = searchData.search_results.top_profiles.map((profile, index) => {
                        const name = profile.title.split(' - ')[0] || profile.title;


                        let platform = 'default';
                        if (profile.platform) {
                            platform = profile.platform;
                        } else if (profile.link.includes('linkedin.com')) {
                            platform = 'linkedin';
                        } else if (profile.link.includes('github.com')) {
                            platform = 'github';
                        } else if (profile.link.includes('indeed.com')) {
                            platform = 'indeed';
                        }


                        return {
                            id: `${search.search_id}_${index}`,
                            name: name,
                            short_summary: profile.snippet || '',
                            full_summary: profile.snippet || '',
                            link: profile.link,
                            score: profile.score,
                            platform: platform
                        };
                    });
                }


                console.log('Transformed profiles:', profiles);


                setProfiles(profiles);
                setSelectedSearchHistory(searchData);
                onNavigate('results');
            }
        } catch (error) {
            console.error('Failed to fetch search details:', error);
            alert('Failed to load search results. Please try again.');
        }
    };


    const handleViewShortlisted = async (search) => {
        try {
            setSelectedSearchHistory(search);
            onNavigate('ats');
        } catch (error) {
            console.error('Failed to navigate to ATS:', error);
            alert('Failed to load shortlisted candidates. Please try again.');
        }
    };


    const fetchSearchHistory = async () => {
        setDashboardLoading(true);
        try {
            const isJobRequisition = viewMode === 'job_requisition';
            const response = await fetch(
                `http://localhost:8000/api/search-history?is_job_requisition=${isJobRequisition}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            const data = await response.json();
            setSearchHistory(data.searches || []);
        } catch (error) {
            console.error('Failed to fetch search history:', error);
            setSearchHistory([]);
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


    const generateJRNumber = (search, index) => {
        const designation = search.designation || 'JOB';
        const serialNo = (index + 1).toString().padStart(3, '0');
        return `JR-${designation}-${serialNo}`;
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


            {/* Toggle Switch */}
            <div className="mb-6 flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Mode:</span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewMode('normal')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'normal'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Normal Searches
                    </button>
                    <button
                        onClick={() => setViewMode('job_requisition')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'job_requisition'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Job Requisitions
                    </button>
                </div>
            </div>


            {/* Metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {searchHistory.length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Total {viewMode === 'job_requisition' ? 'Requisitions' : 'Searches'}
                    </div>
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
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Screen Selects</div>
                </div>
            </div>


            {searchHistory.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                        No {viewMode === 'job_requisition' ? 'job requisitions' : 'searches'} found
                    </div>
                    <div className="text-gray-500 dark:text-gray-500">
                        Click the new search button to get started
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-3 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="col-span-2 text-center">
                            {viewMode === 'job_requisition' ? 'JR No.' : 'S.No.'}
                        </div>
                        <div className="col-span-4">Job Description</div>
                        <div className="col-span-2">Created Date</div>
                        <div className="col-span-1 text-center">Matches</div>
                        <div className="col-span-2 text-center">Screen Selects</div>
                        <div className="col-span-1 text-center">Actions</div>
                    </div>


                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {searchHistory.map((search, index) => (
                            <SearchTile
                                key={search.search_id}
                                search={search}
                                index={index}
                                viewMode={viewMode}
                                jrNumber={generateJRNumber(search, index)}
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


const SearchTile = ({ search, index, viewMode, jrNumber, formatDate, onViewResults, onViewShortlisted, onDelete }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleAction = (action) => {
        action();
        setIsDropdownOpen(false);
    };

    return (
        <div className="grid grid-cols-12 gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="col-span-2 flex items-center justify-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                    {viewMode === 'job_requisition' ? jrNumber : (index + 1).toString().padStart(2, '0')}
                </div>
            </div>


            <div className="col-span-4 flex items-center">
                <div className="truncate">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                        {search.job_description}
                    </div>
                </div>
            </div>


            <div className="col-span-2 flex items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(search.created_at)}
                </div>
            </div>


            <div className="col-span-1 flex items-center justify-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {search.total_matches || 0}
                </div>
            </div>


            <div className="col-span-2 flex items-center justify-center">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {search.shortlisted_count || 0}
                </div>
            </div>


            <div className="col-span-1 flex items-center justify-center gap-2 relative" ref={dropdownRef}>
                {/* Three Dots Button */}
                <button
                    onClick={toggleDropdown}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="Actions"
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 top-10 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                            <button
                                onClick={() => handleAction(() => onViewResults(search))}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Results
                            </button>

                            <button
                                onClick={() => handleAction(() => onViewShortlisted(search))}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!search.shortlisted_count || search.shortlisted_count === 0}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Screen Select
                            </button>

                            <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!search.interview_count || search.interview_count === 0}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Interview
                            </button>

                            <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!search.selected_count || search.selected_count === 0}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Shortlisted
                            </button>

                            <hr className="my-1 border-gray-200 dark:border-gray-600" />

                            <button
                                onClick={() => handleAction(() => onDelete(search.search_id))}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default Dashboard;

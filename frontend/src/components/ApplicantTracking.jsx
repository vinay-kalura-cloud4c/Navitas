import React, { useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import useStore from '../store/useStore';
import { IconSearch, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import ProfileCard from './ProfileCardNew';
import ProfileModal from './ProfileModal';
import axios from 'axios';

const ApplicantTracking = () => {
    const {
        atsProfiles,
        setAtsProfiles,
        selectedAtsProfile,
        setSelectedAtsProfile,
        isAtsModalOpen,
        setIsAtsModalOpen,
        activeTimelineStep,
        setActiveTimelineStep,
        atsSearchQuery,
        setAtsSearchQuery,
        selectedSearchHistory,
        interviews
    } = useStore();

    // Fetch applicants and transform data using profile_metadata
    useEffect(() => {
        const fetchApplicants = async () => {
            if (!selectedSearchHistory?.search_id) return;

            try {
                const res = await axios.get(
                    `http://localhost:8000/api/search/${selectedSearchHistory.search_id}`,
                    { withCredentials: true }
                );
                console.log('Fetched applicants:', res.data);

                if (res.data?.applicants && res.data.applicants.length > 0) {
                    // Transform applicants data to match child component requirements
                    const transformedProfiles = res.data.applicants.map((applicant) => {
                        const metadata = applicant.profile_metadata || {};

                        // Extract name and position
                        const nameParts = metadata.name ? metadata.name.split(' - ') : ['Unknown', 'Candidate'];
                        const name = nameParts[0] || 'Unknown';
                        const position = nameParts[1] || 'Candidate';

                        // Generate initials for avatar
                        const initials = name
                            .split(' ')
                            .map(word => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);

                        return {
                            id: metadata.profile_id || applicant.applicant_id,
                            name: name,
                            position: position,
                            email: '',
                            phone: '',
                            status: applicant.meeting_status || 'invite',
                            appliedDate: selectedSearchHistory.created_at || new Date().toISOString(),
                            avatar: initials,
                            link: metadata.link || '',
                            summary: metadata.short_summary || '',
                            fullSummary: metadata.full_summary || '',
                            score: metadata.score || 0,
                            applicant_id: applicant.applicant_id,
                            platform: metadata.platform || '',
                            meeting_info: applicant.meeting_info || null,
                            timeline: {
                                invite: { completed: false, date: null, time: null },
                                awaiting: { completed: false, date: null, scheduledDate: null, scheduledTime: null },
                                meeting: { completed: false, date: null, duration: null, transcription: null },
                                analysis: {
                                    completed: false,
                                    technicalScore: null,
                                    communicationScore: null,
                                    cultureFit: null,
                                    recommendation: null,
                                    summary: null,
                                },
                            },
                        };
                    });

                    setAtsProfiles(transformedProfiles);
                }
            } catch (err) {
                console.error('Error fetching applicants:', err);
                setAtsProfiles([]); // Clear profiles on error
            }
        };

        fetchApplicants();
    }, [selectedSearchHistory?.search_id, selectedSearchHistory?.created_at, setAtsProfiles, interviews]);

    // Fuzzy search implementation
    const fuse = useMemo(() => {
        return new Fuse(atsProfiles, {
            keys: ['name', 'position', 'summary', 'status'],
            threshold: 0.3,
            includeScore: true,
        });
    }, [atsProfiles]);

    const filteredProfiles = useMemo(() => {
        if (!atsSearchQuery) return atsProfiles;
        const results = fuse.search(atsSearchQuery);
        return results.map((result) => result.item);
    }, [atsSearchQuery, fuse, atsProfiles]);

    const handleProfileClick = (profile) => {
        setSelectedAtsProfile(profile);
        // console.log(profile)
        setIsAtsModalOpen(true);
        setActiveTimelineStep('invite');
    };

    const closeModal = () => {
        setIsAtsModalOpen(false);
        setSelectedAtsProfile(null);
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-neutral-900 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Job Requisition
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and track candidate interview processes
                </p>
                {selectedSearchHistory && (
                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            Job Description: {selectedSearchHistory.job_description}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Total Matches: {selectedSearchHistory.total_matches} | Shortlisted: {selectedSearchHistory.shortlisted_count}
                        </p>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="relative">
                    <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by name, position, or summary..."
                        value={atsSearchQuery}
                        onChange={(e) => setAtsSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {atsSearchQuery && (
                        <button
                            onClick={() => setAtsSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <IconX className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                    <ProfileCard
                        key={profile.id}
                        profile={profile}
                        onClick={() => handleProfileClick(profile)}
                    />
                ))}
            </div>

            {/* No Results */}
            {filteredProfiles.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {atsProfiles.length === 0
                            ? 'No shortlisted candidates available. Please select a search from the dashboard.'
                            : 'No profiles found matching your search'}
                    </p>
                </div>
            )}

            {/* Modal */}
            <ProfileModal
                isOpen={isAtsModalOpen}
                onClose={closeModal}
                profile={selectedAtsProfile}
                activeStep={activeTimelineStep}
                setActiveStep={setActiveTimelineStep}
            />
        </div>
    );
};

export default ApplicantTracking;

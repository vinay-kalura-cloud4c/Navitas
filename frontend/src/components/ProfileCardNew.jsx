import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarSchedule from './Interview/SidebarSchedule';
import { useState, useEffect } from 'react';


const ProfileCard = ({ profile, onClick }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'invite':
                return 'bg-blue-100 text-blue-700';
            case 'awaiting':
                return 'bg-yellow-100 text-yellow-700';
            case 'meeting':
                return 'bg-purple-100 text-purple-700';
            case 'analysis':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Get platform icon and link
    const getPlatformDetails = (platform) => {
        const normalizedPlatform = platform?.toLowerCase() || 'uploaded';
        const platformMap = {
            linkedin: {
                name: 'LinkedIn',
                logo: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                ),
                bgColor: 'bg-[#0077B5] hover:bg-[#006399]',
                linkPrefix: 'https://linkedin.com/in/'
            },
            github: {
                name: 'GitHub',
                logo: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                ),
                bgColor: 'bg-gray-800 hover:bg-gray-900',
                linkPrefix: 'https://github.com/'
            },
            naukri: {
                name: 'Naukri',
                logo: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 1 10 10H2a10 10 0 0 1 10-10z" fill="none" stroke="currentColor" strokeWidth="2" />
                        <text x="12" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">N</text>
                    </svg>
                ),
                bgColor: 'bg-blue-600 hover:bg-blue-700',
                linkPrefix: 'https://www.naukri.com/mnjuser/profile'
            },
            foundit: {
                name: 'Foundit',
                logo: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0" fill="white" />
                    </svg>
                ),
                bgColor: 'bg-orange-600 hover:bg-orange-700',
                linkPrefix: 'https://www.foundit.in/profile'
            },
            uploaded: {
                name: 'Uploaded',
                logo: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm3.5-9h-3v-3.5c0-.276-.224-.5-.5-.5s-.5.224-.5.5v3.5h-3.5c-.276 0-.5.224-.5.5s.224.5.5.5h3.5v3.5c0 .276.224.5.5.5s.5-.224.5-.5v-3.5h3c.276 0 .5-.224.5-.5s-.224-.5-.5-.5z" />
                    </svg>
                ),
                bgColor: 'bg-gray-600 hover:bg-gray-700',
                linkPrefix: ''
            }
        };

        return platformMap[normalizedPlatform] || platformMap['uploaded'];
    };

    const [showScheduleSidebar, setShowScheduleSidebar] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [loadingPlatform, setLoadingPlatform] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


    const generateEmail = (name) => {
        if (!name) return 'by@gmail.com';

        const trimmedName = name.trim();
        const nameParts = trimmedName.split(/\s+/);

        if (nameParts.length === 1) {
            return `${nameParts[0].toLowerCase()}@gmail.com`;
        } else {
            return `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}@gmail.com`;
        }
    };


    const handlePlatformSelect = async (platform) => {
        setLoadingPlatform(platform);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const email = generateEmail(profile.name);
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        setSuccessMessage(`Invitation sent successfully to ${email} via ${platformName}`);

        setLoadingPlatform(null);
        setShowInviteModal(false);
        setShowSuccessToast(true);

        setTimeout(() => {
            setShowSuccessToast(false);
        }, 4000);
    };

    const platformDetails = getPlatformDetails(profile.platform);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 dark:border-neutral-700"
            >
                {/* Avatar and Score Badge */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {profile.avatar}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.position}</p>
                        </div>
                    </div>
                    {/* Match Score Badge */}
                    <div className="flex flex-col items-end">
                        <span className="px-1 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-semibold">
                            {(profile.score * 100).toFixed(0)}% Match
                        </span>
                    </div>
                </div>


                {/* Summary */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{profile.summary}</p>
                </div>


                {/* Platform Logo Badge */}
                {profile.link && (
                    <div className="mb-4">
                        <a
                            href={profile.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-white transition-all hover:shadow-lg transform hover:scale-110 ${platformDetails.bgColor}`}
                            title={`View ${platformDetails.name} Profile`}
                        >
                            {platformDetails.logo}
                        </a>
                    </div>
                )}


                {/* Buttons container */}
                <div className="mb-4 flex gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInviteModal(true);
                        }}
                        className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition"
                        type="button"
                    >
                        Send Invite
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowScheduleSidebar(true);
                        }}
                        className="px-3 py-1 rounded bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition"
                        type="button"
                    >
                        Schedule Meetings
                    </button>


                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                        type="button"
                    >
                        Check Status
                    </button>



                </div>
            </motion.div>


            {/* Schedule Sidebar */}
            {showScheduleSidebar && (
                <SidebarSchedule
                    profile={profile}
                    onClose={() => setShowScheduleSidebar(false)}
                    onSuccess={() => {
                        // Optionally refresh or update parent state after scheduling
                    }}
                />
            )}


            {/* Invite Platform Modal */}
            {showInviteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowInviteModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Choose Platform
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Select a platform to send invite to {profile.name}
                            </p>
                        </div>


                        <div className="space-y-3">
                            {/* LinkedIn Button */}
                            <button
                                onClick={() => handlePlatformSelect('linkedin')}
                                disabled={loadingPlatform !== null}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loadingPlatform === 'linkedin' ? (
                                    <motion.div
                                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                )}
                                {loadingPlatform === 'linkedin' ? 'Sending...' : 'LinkedIn'}
                            </button>


                            {/* WhatsApp Button */}
                            <button
                                onClick={() => handlePlatformSelect('whatsapp')}
                                disabled={loadingPlatform !== null}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loadingPlatform === 'whatsapp' ? (
                                    <motion.div
                                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                )}
                                {loadingPlatform === 'whatsapp' ? 'Sending...' : 'WhatsApp'}
                            </button>


                            {/* Email Button */}
                            <button
                                onClick={() => handlePlatformSelect('email')}
                                disabled={loadingPlatform !== null}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loadingPlatform === 'email' ? (
                                    <motion.div
                                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                )}
                                {loadingPlatform === 'email' ? 'Sending...' : 'Email'}
                            </button>
                        </div>


                        {/* Close button */}
                        <button
                            onClick={() => setShowInviteModal(false)}
                            disabled={loadingPlatform !== null}
                            className="mt-6 w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}


            {/* Success Toast Notification */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-8 right-8 z-[60] bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md"
                    >
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium">{successMessage}</p>
                        <button
                            onClick={() => setShowSuccessToast(false)}
                            className="ml-auto flex-shrink-0 hover:bg-green-700 rounded p-1 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


export default ProfileCard;

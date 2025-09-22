import { create } from 'zustand';

const useStore = create((set) => ({
  profiles: [],
  loading: false,
  savedProfiles: [],
  selectedProfile: null,
  isOverlayVisible: false,
  meetingSubject: '',
  durationMinutes: 30,
  additionalEmail: '',

  // Dashboard related state
  searchHistory: [],
  dashboardLoading: false,
  selectedSearchHistory: null, // Add this to store the selected search

  setProfiles: (profiles) => set({ profiles }),
  setLoading: (loading) => set({ loading }),
  setSavedProfiles: (savedProfiles) => set({ savedProfiles }),
  setSelectedProfile: (selectedProfile) => set({ selectedProfile }),
  setIsOverlayVisible: (isOverlayVisible) => set({ isOverlayVisible }),
  setMeetingSubject: (meetingSubject) => set({ meetingSubject }),
  setDurationMinutes: (durationMinutes) => set({ durationMinutes }),
  setAdditionalEmail: (additionalEmail) => set({ additionalEmail }),

  // Dashboard setters
  setSearchHistory: (searchHistory) => set({ searchHistory }),
  setDashboardLoading: (dashboardLoading) => set({ dashboardLoading }),
  setSelectedSearchHistory: (selectedSearchHistory) => set({ selectedSearchHistory }), // Add this
}));

export default useStore;

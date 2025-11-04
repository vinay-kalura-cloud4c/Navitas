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
  searchHistory: [],
  dashboardLoading: false,
  selectedSearchHistory: null,

  // ATS specific state
  atsProfiles: [],
  selectedAtsProfile: null,
  isAtsModalOpen: false,
  activeTimelineStep: 'invite',
  atsSearchQuery: '',

  // Interview rounds state
  interviews: [], // { id, roundNumber, title, date, time, meetingId, status, verdict, interviewerEmail, candidateEmail }
  selectedInterview: null,
  isSchedulingModalOpen: false,

  setProfiles: (profiles) => set({ profiles }),
  setLoading: (loading) => set({ loading }),
  setSavedProfiles: (savedProfiles) => set({ savedProfiles }),
  setSelectedProfile: (selectedProfile) => set({ selectedProfile }),
  setIsOverlayVisible: (isOverlayVisible) => set({ isOverlayVisible }),
  setMeetingSubject: (meetingSubject) => set({ meetingSubject }),
  setDurationMinutes: (durationMinutes) => set({ durationMinutes }),
  setAdditionalEmail: (additionalEmail) => set({ additionalEmail }),
  setSearchHistory: (searchHistory) => set({ searchHistory }),
  setDashboardLoading: (dashboardLoading) => set({ dashboardLoading }),
  setSelectedSearchHistory: (selectedSearchHistory) => set({ selectedSearchHistory }),

  // ATS setters
  setAtsProfiles: (atsProfiles) => set({ atsProfiles }),
  setSelectedAtsProfile: (selectedAtsProfile) => set({ selectedAtsProfile }),
  setIsAtsModalOpen: (isAtsModalOpen) => set({ isAtsModalOpen }),
  setActiveTimelineStep: (activeTimelineStep) => set({ activeTimelineStep }),
  setAtsSearchQuery: (atsSearchQuery) => set({ atsSearchQuery }),

  // Interview setters
  setInterviews: (interviews) => set({ interviews }),
  setSelectedInterview: (selectedInterview) => set({ selectedInterview }),
  setIsSchedulingModalOpen: (isSchedulingModalOpen) => set({ isSchedulingModalOpen }),

  addInterview: (interview) => set((state) => ({
    interviews: [...state.interviews, interview]
  })),

  updateInterview: (id, updates) => set((state) => ({
    interviews: state.interviews.map(interview =>
      interview.id === id ? { ...interview, ...updates } : interview
    )
  })),
}));

export default useStore;

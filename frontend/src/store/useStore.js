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

  setProfiles: (profiles) => set({ profiles }),
  setLoading: (loading) => set({ loading }),
  setSavedProfiles: (savedProfiles) => set({ savedProfiles }),
  setSelectedProfile: (selectedProfile) => set({ selectedProfile }),
  setIsOverlayVisible: (isOverlayVisible) => set({ isOverlayVisible }),
  setMeetingSubject: (meetingSubject) => set({ meetingSubject }),
  setDurationMinutes: (durationMinutes) => set({ durationMinutes }),
  setAdditionalEmail: (additionalEmail) => set({ additionalEmail }),
}));

export default useStore;

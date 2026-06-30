import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  isOnboarded: boolean;
  profession: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  customInstructions: string;
  theme: "default" | "light" | "dark";
  enableVoice: boolean;
  aiMode: "local" | "gemini";
  userGeminiApiKey: string;
}

interface UserStore extends UserProfile {
  completeOnboarding: (data: Omit<UserProfile, 'isOnboarded' | 'theme' | 'enableVoice' | 'aiMode' | 'userGeminiApiKey'>) => void;
  updateProfile: (data: Partial<Omit<UserProfile, 'isOnboarded'>>) => void;
  resetOnboarding: () => void;
  setAiMode: (mode: "local" | "gemini") => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      isOnboarded: false,
      profession: '',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      customInstructions: '',
      theme: 'default',
      enableVoice: true,
      aiMode: 'local',
      userGeminiApiKey: '',
      completeOnboarding: (data) => set({ isOnboarded: true, ...data }),
      updateProfile: (data) => set((state) => ({ ...state, ...data })),
      setAiMode: (mode) => set({ aiMode: mode }),
      resetOnboarding: () => set({ 
        isOnboarded: false, 
        profession: '', 
        workingHoursStart: '09:00', 
        workingHoursEnd: '17:00', 
        customInstructions: '',
        theme: 'default',
        enableVoice: true,
        aiMode: 'local',
        userGeminiApiKey: '',
      }),
    }),
    {
      name: 'commit-ai-user-store',
    }
  )
);

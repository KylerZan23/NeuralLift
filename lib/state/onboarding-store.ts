import { create } from 'zustand';

interface OnboardingState {
  pendingPRs: Record<string, number>;
  setPendingPR: (lift: string, weight: number) => void;
  clearPendingPRs: () => void;
  getPendingPRs: () => Record<string, number>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  pendingPRs: {},
  setPendingPR: (lift, weight) => set((state) => ({
    pendingPRs: { ...state.pendingPRs, [lift]: weight }
  })),
  clearPendingPRs: () => set({ pendingPRs: {} }),
  getPendingPRs: () => get().pendingPRs,
}));

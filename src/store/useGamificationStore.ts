import { create } from 'zustand';

interface GamificationState {
  xpGain: number;
  coinsGain: number;
  lastEvent: string | null;
  pushReward: (payload: { xp: number; coins: number; event: string }) => void;
  reset: () => void;
}

const useGamificationStore = create<GamificationState>((set) => ({
  xpGain: 0,
  coinsGain: 0,
  lastEvent: null,
  pushReward: ({ xp, coins, event }) =>
    set({
      xpGain: xp,
      coinsGain: coins,
      lastEvent: event
    }),
  reset: () => set({ xpGain: 0, coinsGain: 0, lastEvent: null })
}));

export default useGamificationStore;


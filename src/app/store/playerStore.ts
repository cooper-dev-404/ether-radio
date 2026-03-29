import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  enginePlay,
  enginePause,
  engineResume,
  engineSetVolume,
  engineDestroy,
} from '../audio/audioEngine';

export interface Station {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved?: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  /** Province/region for CN domestic stations (e.g. '北京', '上海', '全国', '其他') */
  province?: string;
}

interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  recentlyPlayed: Station[];
  favorites: Station[];
  showNowPlaying: boolean;
  sleepTimerEnd: number | null; // Unix timestamp (ms), null = no timer
  region: 'international' | 'domestic';

  play: (station: Station) => void;
  pause: () => void;
  resume: () => void;
  retry: () => void;
  setVolume: (v: number) => void;
  toggleFavorite: (station: Station) => void;
  setShowNowPlaying: (show: boolean) => void;
  isFavorite: (uuid: string) => boolean;
  setSleepTimer: (minutes: number | null) => void;
  setRegion: (region: 'international' | 'domestic') => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentStation: null,
      isPlaying: false,
      isLoading: false,
      hasError: false,
      volume: 0.75,
      recentlyPlayed: [],
      favorites: [],
      showNowPlaying: false,
      sleepTimerEnd: null,
      region: 'international',

      play: (station: Station) => {
        set({ currentStation: station, isLoading: true, hasError: false, isPlaying: false });

        // Add to recently played (max 20), deduplicated
        const recent = get().recentlyPlayed;
        const filtered = recent.filter(s => s.stationuuid !== station.stationuuid);
        set({ recentlyPlayed: [station, ...filtered].slice(0, 20) });

        const streamUrl = station.url_resolved || station.url;

        enginePlay(streamUrl, get().volume, {
          onCanPlay: () => {
            set({ isLoading: false, isPlaying: true });
          },

          onPlaying: () => {
            set({ isLoading: false, isPlaying: true });
          },

          onWaiting: () => {
            set({ isLoading: true });
          },

          onError: (_fatal: boolean) => {
            // Only fire the error UI if this station is still current
            // (prevents stale callbacks from a previous session firing)
            const { currentStation } = get();
            if (currentStation?.stationuuid !== station.stationuuid) return;

            set({ isLoading: false, isPlaying: false, hasError: true });

            // Show a localised toast for CN (HLS) station errors
            if (station.countrycode === 'CN') {
              toast('📻 信号中断，请重试', {
                description: station.name,
                duration: 3500,
              });
            } else {
              toast('⚠ Signal lost — tap to retry', {
                description: station.name,
                duration: 3500,
              });
            }
          },

          onPause: () => {
            // Only update state if we're not mid-load (avoids flickering
            // during HLS segment switches which briefly pause the element)
            if (!get().isLoading) {
              set({ isPlaying: false });
            }
          },
        });
      },

      pause: () => {
        enginePause();
        set({ isPlaying: false });
      },

      resume: () => {
        set({ isLoading: true });
        engineResume()
          .then(() => {
            set({ isPlaying: true, isLoading: false });
          })
          .catch(() => {
            set({ isLoading: false });
          });
      },

      retry: () => {
        const station = get().currentStation;
        if (station) {
          get().play(station);
        }
      },

      setVolume: (v: number) => {
        set({ volume: v });
        engineSetVolume(v);
      },

      toggleFavorite: (station: Station) => {
        const favorites = get().favorites;
        const exists = favorites.some(f => f.stationuuid === station.stationuuid);
        if (exists) {
          set({ favorites: favorites.filter(f => f.stationuuid !== station.stationuuid) });
        } else {
          set({ favorites: [station, ...favorites] });
        }
      },

      setShowNowPlaying: (show: boolean) => {
        set({ showNowPlaying: show });
      },

      isFavorite: (uuid: string) => {
        return get().favorites.some(f => f.stationuuid === uuid);
      },

      setSleepTimer: (minutes: number | null) => {
        if (minutes === null) {
          set({ sleepTimerEnd: null });
        } else {
          set({ sleepTimerEnd: Date.now() + minutes * 60 * 1000 });
        }
      },

      setRegion: (region: 'international' | 'domestic') => {
        // Do NOT touch audio — currently playing station continues uninterrupted
        set({ region });
      },
    }),
    {
      name: 'ether-radio-storage',
      partialize: (state) => ({
        recentlyPlayed: state.recentlyPlayed,
        favorites: state.favorites,
        volume: state.volume,
        region: state.region,
        // sleepTimerEnd, isPlaying, isLoading, hasError intentionally not persisted
      }),
    }
  )
);

// Clean up audio engine when the module hot-reloads in dev
// (Vite HMR will re-execute this file; without cleanup you get audio overlap)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    engineDestroy();
  });
}
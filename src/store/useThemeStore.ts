import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeSettings {
  theme: 'default' | 'sunset' | 'forest' | 'ocean' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  backgroundColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  mascotEnabled: boolean;
  particlesEnabled: boolean;
  sidebarCollapsed: boolean;
  layout: 'default' | 'compact' | 'spacious';
}

interface ThemeStore extends ThemeSettings {
  setTheme: (theme: ThemeSettings['theme']) => void;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  resetToDefault: () => void;
}

const defaultSettings: ThemeSettings = {
  theme: 'default',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  backgroundColor: '#0f172a',
  accentColor: '#3b82f6',
  fontSize: 'medium',
  animations: true,
  mascotEnabled: true,
  particlesEnabled: true,
  sidebarCollapsed: false,
  layout: 'default'
};

const themeConfigs = {
  default: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#0f172a',
    accentColor: '#3b82f6'
  },
  sunset: {
    primaryColor: '#f59e0b',
    secondaryColor: '#fb923c',
    backgroundColor: '#7c2d12',
    accentColor: '#f59e0b'
  },
  forest: {
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    backgroundColor: '#064e3b',
    accentColor: '#10b981'
  },
  ocean: {
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    backgroundColor: '#164e63',
    accentColor: '#06b6d4'
  },
  custom: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#0f172a',
    accentColor: '#3b82f6'
  }
};

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setTheme: (theme) => {
        const themeConfig = themeConfigs[theme];
        set({
          theme,
          ...themeConfig
        });
      },

      updateSettings: (settings) => {
        set(settings);
      },

      resetToDefault: () => {
        set(defaultSettings);
      }
    }),
    {
      name: 'lumos-theme-storage',
      version: 1
    }
  )
);

export default useThemeStore;





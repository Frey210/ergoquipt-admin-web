import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'
export type LanguageCode = 'id' | 'en'

interface PreferencesState {
  theme: ThemeMode
  language: LanguageCode
  setTheme: (theme: ThemeMode) => void
  setLanguage: (language: LanguageCode) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'id',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'preferences-storage',
    }
  )
)

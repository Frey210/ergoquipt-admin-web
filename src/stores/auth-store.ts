import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  initializeFromStorage: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        localStorage.setItem('ergoquipt_token', token)
        localStorage.setItem('ergoquipt_user', JSON.stringify(user))
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('ergoquipt_token')
        localStorage.removeItem('ergoquipt_user')
        set({ token: null, user: null, isAuthenticated: false })
      },
      initializeFromStorage: () => {
        const token = localStorage.getItem('ergoquipt_token')
        const userRaw = localStorage.getItem('ergoquipt_user')
        if (token && userRaw) {
          try {
            const user = JSON.parse(userRaw) as User
            set({ token, user, isAuthenticated: true })
          } catch {
            set({ token: null, user: null, isAuthenticated: false })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

// src/pages/Login.tsx - Updated design
import React, { useState } from 'react'
import { Activity, BarChart3, Ruler, FlaskConical } from 'lucide-react'
import { useAuthStore } from '../stores/auth-store'
import { authAPI } from '../services/api'

const Login: React.FC = () => {
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const response = await authAPI.login({
        username,
        password,
        platform: 'web'
      })

      if (response.requires_password_change) {
        setError('Password harus diganti terlebih dahulu sebelum login.')
        return
      }

      localStorage.setItem('ergoquipt_token', response.access_token)
      const profile = await authAPI.getProfile()
      login(response.access_token, profile)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] font-body">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,148,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,148,255,0.08) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      ></div>
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl"></div>
      <div className="pointer-events-none absolute inset-0 login-3d-scene">
        <div className="login-3d-card animate-float-slow absolute left-[10%] top-[16%] hidden h-24 w-24 items-center justify-center rounded-full border border-brand-500/30 bg-white/70 shadow-[0_18px_45px_rgba(56,148,255,0.2)] backdrop-blur lg:flex">
          <Ruler size={28} className="text-brand-600" />
        </div>
        <div className="login-3d-card animate-float-medium absolute right-[12%] top-[12%] hidden h-28 w-28 items-center justify-center rounded-[28px] border border-brand-500/30 bg-white/70 shadow-[0_20px_50px_rgba(56,148,255,0.22)] backdrop-blur lg:flex">
          <Activity size={30} className="text-brand-600" />
        </div>
        <div className="login-3d-card animate-float-fast absolute right-[18%] bottom-[20%] hidden h-24 w-24 items-center justify-center rounded-full border border-brand-500/30 bg-white/70 shadow-[0_18px_45px_rgba(56,148,255,0.2)] backdrop-blur lg:flex">
          <FlaskConical size={26} className="text-brand-600" />
        </div>
        <div className="login-3d-card animate-float-slow absolute left-[16%] bottom-[18%] hidden h-24 w-24 items-center justify-center rounded-[26px] border border-brand-500/30 bg-white/70 shadow-[0_18px_45px_rgba(56,148,255,0.2)] backdrop-blur lg:flex">
          <BarChart3 size={26} className="text-brand-600" />
        </div>
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-4 rounded-3xl bg-white/90 px-5 py-4 shadow-xl shadow-brand-500/10 backdrop-blur animate-fade-in">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-sky-500 p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                  <img src="/logo.svg" alt="Ergoquipt" className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[var(--text-primary)] font-display">Ergoquipt</h1>
                <p className="text-sm text-[var(--text-secondary)]">Laboratory Admin System</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-semibold text-[var(--text-primary)] font-display">Welcome back</h2>
              <p className="mt-2 text-[var(--text-secondary)]">
                Secure access for laboratory operations, monitoring, and reporting.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-[var(--text-muted)] lg:justify-start">
              <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2">Realtime monitoring</span>
              <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2">Operator management</span>
              <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2">Secure reports</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-2xl shadow-brand-500/10 animate-fade-in">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-[var(--text-primary)] font-display">Sign in</h3>
              <p className="text-sm text-[var(--text-secondary)]">Use your administrator credentials to continue.</p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  placeholder="admin"
                  defaultValue="admin"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#3894FF] px-4 py-4 font-semibold text-white shadow-lg shadow-[0_18px_40px_rgba(56,148,255,0.35)] transition hover:-translate-y-0.5 hover:bg-[#2d7be6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="ml-3">Signing in...</span>
                  </div>
                ) : (
                  <>
                    Sign In to Dashboard
                    <span className="h-2 w-2 rounded-full bg-white/70"></span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Ergoquipt Laboratory Management System v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

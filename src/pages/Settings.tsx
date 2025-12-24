import React, { useEffect } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { usePreferencesStore } from '../stores/preferences-store'
import { useI18n } from '../utils/i18n'
import { Globe, Sun, User } from 'lucide-react'

const Settings: React.FC = () => {
  const { user } = useAuthStore()
  const { theme, language, setTheme, setLanguage } = usePreferencesStore()
  const { t } = useI18n()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.lang = language
    document.documentElement.lang = language
  }, [theme, language])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-display">{t('settings')}</h1>
        <p className="text-[var(--text-secondary)]">{t('settingsDesc')}</p>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-3 text-[var(--text-secondary)]">
              <Sun size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">{t('appearance')}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{t('appearanceDesc')}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-alt)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t('darkMode')}</p>
              <p className="text-xs text-[var(--text-secondary)]">{t('lightMode')} / {t('darkMode')}</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${
                theme === 'dark' ? 'bg-[#3894FF] border-white/40 shadow-[0_0_0_2px_rgba(56,148,255,0.35)]' : 'bg-slate-300 border-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-black/10 transition ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-3 text-[var(--text-secondary)]">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">{t('language')}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{t('languageDesc')}</p>
            </div>
          </div>
          <div className="mt-5 inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-alt)] p-1 text-sm">
            <button
              onClick={() => setLanguage('id')}
              className={`rounded-full px-4 py-2 font-medium ${
                language === 'id' ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              Bahasa
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-full px-4 py-2 font-medium ${
                language === 'en' ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--surface-alt)] p-3 text-[var(--text-secondary)]">
            <User size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">{t('profile')}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('profileDesc')}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Name</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.full_name || 'Admin'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Email</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Role</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] capitalize">{user?.role || 'administrator'}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Settings

// src/components/Layout/AppLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { usePreferencesStore } from '../../stores/preferences-store';
import { useI18n } from '../../utils/i18n';
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, language } = usePreferencesStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.lang = language;
    document.documentElement.lang = language;
  }, [theme, language]);

  const isSuperAdmin = user?.role === 'super_admin';

  const navigation = [
    {
      title: 'core',
      items: [
        { name: 'dashboard', href: '/', icon: LayoutDashboard },
        { name: 'operators', href: '/operators', icon: Users },
        ...(isSuperAdmin ? [{ name: 'admins', href: '/admins', icon: Users }] : []),
        { name: 'sessions', href: '/sessions', icon: Calendar },
        { name: 'respondents', href: '/respondents', icon: UserCheck },
      ],
    },
    {
      title: 'monitoring',
      items: [
        { name: 'monitoringTympani', href: '/monitoring/tympani', icon: Activity },
        { name: 'monitoringHrv', href: '/monitoring/hrv', icon: Activity },
      ],
    },
    {
      title: 'reports',
      items: [
        { name: 'summary', href: '/summary', icon: BarChart3 },
        { name: 'analytics', href: '/analytics', icon: BarChart3 },
        { name: 'dataExport', href: '/export', icon: Download },
      ],
    },
    {
      title: 'system',
      items: [{ name: 'settings', href: '/settings', icon: Settings }],
    },
  ];

  const flattened = navigation.flatMap((group) => group.items);
  const current = flattened.find((item) => item.href === location.pathname);

  const handleNavigate = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-transparent font-body text-[15px] text-[var(--text-primary)]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border-soft)] bg-[var(--surface)] shadow-xl backdrop-blur-lg transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-soft)]">
          <button onClick={() => handleNavigate('/')} className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-sky-500 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                <img src="/logo.svg" alt="Ergoquipt" className="h-6 w-6" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-[var(--text-primary)] font-display">Ergoquipt</p>
              <p className="text-xs text-[var(--text-secondary)]">Laboratory Admin</p>
            </div>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {t(group.title as any)}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 shadow-sm'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          isActive ? 'bg-brand-100 text-brand-600' : 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <item.icon size={18} />
                      </span>
                      <span className="flex-1 text-left">{t(item.name as any)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border-soft)] px-6 py-5">
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.full_name?.split(' ').map((part) => part[0]).join('') || 'AD'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-[var(--text-secondary)] capitalize">{user?.role || 'administrator'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:border-slate-300 hover:bg-[var(--surface-alt)]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--surface)] px-6 py-4 backdrop-blur relative">
          <span className="pointer-events-none absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-brand-500/80 via-sky-500/60 to-brand-500/30"></span>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--surface-alt)] lg:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{t('workspace')}</p>
                <h1 className="text-xl font-semibold text-[var(--text-primary)] font-display">
                  {current ? t(current.name as any) : t('dashboard')}
                </h1>
              </div>
              <div className="hidden md:flex items-center text-xs text-[var(--text-muted)]">
                <span className="mx-3 h-1 w-1 rounded-full bg-slate-300"></span>
                <span>Ergoquipt / {current ? t(current.name as any) : t('dashboard')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/summary')}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-500"
              >
                {t('viewSummary')}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

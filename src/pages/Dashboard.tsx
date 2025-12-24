import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, systemAPI } from '../services/api'
import { Activity, BarChart3, FlaskConical, Timer, Users } from 'lucide-react'

type DashboardStats = {
  totalOperators: number
  activeOperators: number
  tympaniCount: number
  hrvCount: number
  totalRecordings: number
  averageDuration: number | null
  backendHealthy: boolean
  lastChecked: string | null
}

type RecordingActivity = {
  id: string
  type: 'tympani' | 'hrv'
  label: string
  operatorName: string
  respondentName: string
  createdAt: string
  durationMinutes: number | null
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecordingActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dateRange = useMemo(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 30)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [])

  const recordingMix = useMemo(() => {
    if (!stats) return null
    const total = stats.tympaniCount + stats.hrvCount
    if (!total) {
      return { total: 0, tympaniPct: 0, hrvPct: 0 }
    }
    const tympaniPct = Math.round((stats.tympaniCount / total) * 100)
    const hrvPct = Math.max(0, 100 - tympaniPct)
    return { total, tympaniPct, hrvPct }
  }, [stats])

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const [operators, summary, tympani, hrv, health] = await Promise.all([
          adminAPI.getUsers({ role: 'operator', page: 1, limit: 100 }),
          adminAPI.getSummaryGlobal({ from_time: dateRange.from, to_time: dateRange.to }),
          adminAPI.listTympaniRecordings({ limit: 8, offset: 0 }),
          adminAPI.listHrvRecordings({ limit: 8, offset: 0 }),
          systemAPI.healthCheck(),
        ])

        const allRecordings = [
          ...tympani.items.map((item) => ({
            id: item.id,
            type: 'tympani' as const,
            label: item.label,
            operatorName: item.operator_name || 'Unknown',
            respondentName: item.respondent?.name || 'Unknown',
            createdAt: item.created_at,
            durationMinutes: item.time_start && item.time_end ? (new Date(item.time_end).getTime() - new Date(item.time_start).getTime()) / 60000 : null,
          })),
          ...hrv.items.map((item) => ({
            id: item.id,
            type: 'hrv' as const,
            label: item.label,
            operatorName: item.operator_name || 'Unknown',
            respondentName: item.respondent?.name || 'Unknown',
            createdAt: item.created_at,
            durationMinutes: item.time_start && item.time_end ? (new Date(item.time_end).getTime() - new Date(item.time_start).getTime()) / 60000 : null,
          })),
        ]

        const sortedRecent = allRecordings
          .filter((item) => item.createdAt)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)

        const durationSamples = allRecordings
          .map((item) => item.durationMinutes)
          .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
        const averageDuration = durationSamples.length
          ? Math.round((durationSamples.reduce((sum, value) => sum + value, 0) / durationSamples.length) * 10) / 10
          : null

        setStats({
          totalOperators: operators.length,
          activeOperators: summary.operators_active || 0,
          tympaniCount: tympani.total || 0,
          hrvCount: hrv.total || 0,
          totalRecordings: (tympani.total || 0) + (hrv.total || 0),
          averageDuration,
          backendHealthy: health?.status === 'healthy',
          lastChecked: health?.timestamp || null,
        })
        setRecentActivity(sortedRecent)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [dateRange.from, dateRange.to])

  const quickActions = [
    {
      title: 'Operator management',
      description: 'Invite, activate, and reset access',
      action: () => navigate('/operators'),
      color: 'bg-lilac-50',
      iconBg: 'bg-lilac-100 text-lilac-600',
      icon: Users,
    },
    {
      title: 'Monitoring',
      description: 'Track live tympani & HRV intake',
      action: () => navigate('/monitoring/tympani'),
      color: 'bg-mint-50',
      iconBg: 'bg-mint-100 text-mint-600',
      icon: Activity,
    },
    {
      title: 'Summary report',
      description: 'Aggregate trends per operator',
      action: () => navigate('/summary'),
      color: 'bg-sky-50',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: BarChart3,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard</p>
          <p className="text-sm text-slate-400 mt-1">Syncing laboratory metrics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] font-display">Laboratory snapshot</h2>
          <p className="text-[var(--text-secondary)]">Overview of data intake, operators, and device health.</p>
        </div>
        {stats && (
          <div className="rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-xs font-semibold text-brand-600">
            Last 30 days
          </div>
        )}
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {stats && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-lilac-50 p-3 text-lilac-600">
                <Users size={20} />
              </div>
              <span className="text-xs font-semibold text-slate-400">Operators</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{stats.totalOperators}</p>
            <p className="text-sm text-[var(--text-secondary)]">Total operators onboarded</p>
          </div>

          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-mint-50 p-3 text-mint-600">
                <Activity size={20} />
              </div>
              <span className="text-xs font-semibold text-slate-400">Active</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{stats.activeOperators}</p>
            <p className="text-sm text-[var(--text-secondary)]">Operators active (30 days)</p>
          </div>

          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-peach-50 p-3 text-peach-600">
                <FlaskConical size={20} />
              </div>
              <span className="text-xs font-semibold text-slate-400">Recordings</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{stats.totalRecordings}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Tympani {stats.tympaniCount} · HRV {stats.hrvCount}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                <Timer size={20} />
              </div>
              <span className="text-xs font-semibold text-slate-400">Duration</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">
              {stats.averageDuration ? `${stats.averageDuration} min` : '—'}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">Average recent recording</p>
          </div>
        </section>
      )}

      {stats && (
        <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] font-display">System health</h3>
              <p className="text-sm text-[var(--text-secondary)]">Backend availability and last check.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${stats.backendHealthy ? 'bg-mint-500' : 'bg-red-500'}`}></span>
              <span className="text-[var(--text-secondary)]">{stats.backendHealthy ? 'Healthy' : 'Offline'}</span>
            </div>
          </div>
          {stats.lastChecked && (
            <p className="mt-3 text-xs text-[var(--text-muted)]">Last checked: {new Date(stats.lastChecked).toLocaleString()}</p>
          )}
          {recordingMix && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                <span>Recording mix</span>
                <span>{recordingMix.total} total</span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                <div style={{ width: `${recordingMix.tympaniPct}%` }} className="bg-peach-500 transition-all"></div>
                <div style={{ width: `${recordingMix.hrvPct}%` }} className="bg-sky-500 transition-all"></div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-peach-500"></span>
                  Tympani {recordingMix.tympaniPct}%
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  HRV {recordingMix.hrvPct}%
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] font-display">Quick actions</h3>
            <span className="text-xs font-semibold text-[var(--text-muted)]">{quickActions.length} tools</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.action}
                className={`group rounded-2xl border border-slate-200/80 p-4 text-left transition hover:-translate-y-1 hover:shadow-lg hover:border-brand-200 ${action.color}`}
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl transition group-hover:scale-105 ${action.iconBg}`}>
                  <action.icon size={18} />
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{action.title}</h4>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] font-display">Recent recordings</h3>
            <button onClick={() => navigate('/summary')} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Open summary
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-start gap-3 rounded-2xl bg-[var(--surface-alt)] px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.type === 'tympani' ? 'bg-peach-500' : 'bg-sky-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.respondentName}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {item.type.toUpperCase()} · {item.operatorName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {item.durationMinutes ? `${item.durationMinutes.toFixed(1)} min` : 'Duration n/a'} ·{' '}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {!recentActivity.length && (
              <div className="rounded-2xl border border-dashed border-[var(--border-soft)] p-6 text-center text-sm text-[var(--text-muted)]">
                No recordings available yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard

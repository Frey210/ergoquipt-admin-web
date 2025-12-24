import React, { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../services/api'
import type { SummaryGlobalResponse, SummaryOperatorResponse, SummaryTimeSeriesResponse } from '../types'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [globalData, setGlobalData] = useState<SummaryGlobalResponse | null>(null)
  const [operatorData, setOperatorData] = useState<SummaryOperatorResponse | null>(null)
  const [timeSeries, setTimeSeries] = useState<SummaryTimeSeriesResponse | null>(null)

  const groupBy = useMemo(() => {
    if (timeRange === '7') return 'day'
    if (timeRange === '30') return 'week'
    return 'month'
  }, [timeRange])

  const dateRange = useMemo(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - Number(timeRange))
    return { from: from.toISOString(), to: to.toISOString() }
  }, [timeRange])

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      setError('')
      try {
        const [globalRes, operatorRes, seriesRes] = await Promise.all([
          adminAPI.getSummaryGlobal({ from_time: dateRange.from, to_time: dateRange.to }),
          adminAPI.getSummaryOperators({ from_time: dateRange.from, to_time: dateRange.to }),
          adminAPI.getSummaryTimeseries({
            from_time: dateRange.from,
            to_time: dateRange.to,
            group_by: groupBy,
            metric: 'both',
          }),
        ])
        setGlobalData(globalRes)
        setOperatorData(operatorRes)
        setTimeSeries(seriesRes)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [dateRange.from, dateRange.to, groupBy])

  const chartData = (timeSeries?.series || []).map((item) => ({
    period: item.period,
    Tympani: item.tympani_count,
    HRV: item.hrv_count,
  }))

  const totalRecordings = (globalData?.tympani_count || 0) + (globalData?.hrv_count || 0)
  const avgPerPeriod = chartData.length
    ? Math.round((totalRecordings / chartData.length) * 10) / 10
    : 0

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-display">Analytics</h1>
          <p className="text-[var(--text-secondary)]">Aggregate tympani & HRV performance across the lab.</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
          className="rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-[0_12px_24px_rgba(56,148,255,0.08)]">
          <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Total</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{totalRecordings}</p>
          <p className="text-sm text-[var(--text-secondary)]">Recordings in range</p>
        </div>
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-[0_12px_24px_rgba(56,148,255,0.08)]">
          <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Tympani</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{globalData?.tympani_count || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">Tympani sessions</p>
        </div>
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-[0_12px_24px_rgba(56,148,255,0.08)]">
          <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">HRV</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{globalData?.hrv_count || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">HRV sessions</p>
        </div>
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-[0_12px_24px_rgba(56,148,255,0.08)]">
          <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Average</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{avgPerPeriod}</p>
          <p className="text-sm text-[var(--text-secondary)]">Per {groupBy}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">Trend per {groupBy}</h2>
            <span className="text-xs font-semibold text-[var(--text-muted)]">{chartData.length} periods</span>
          </div>
          <div className="mt-6 h-72 min-h-[18rem] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTympani" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f7b283" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f7b283" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8bd2f8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8bd2f8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Tympani" stroke="#f18a4f" fill="url(#colorTympani)" />
                <Area type="monotone" dataKey="HRV" stroke="#5fb5e9" fill="url(#colorHrv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">Top operators</h2>
          <p className="text-sm text-[var(--text-secondary)]">Recordings contributed by operator.</p>
          <div className="mt-4 space-y-4">
            {(operatorData?.items || []).slice(0, 5).map((item) => (
              <div key={item.operator_id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.operator_name || 'Unknown'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Tympani {item.tympani_count} · HRV {item.hrv_count}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{item.tympani_count + item.hrv_count}</span>
              </div>
            ))}
            {!operatorData?.items?.length && (
              <div className="rounded-2xl border border-dashed border-[var(--border-soft)] p-4 text-center text-sm text-[var(--text-muted)]">
                No operator data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

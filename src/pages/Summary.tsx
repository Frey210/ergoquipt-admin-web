import React, { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../services/api'
import type {
  SummaryGlobalResponse,
  SummaryOperatorResponse,
  SummaryTimeSeriesResponse,
  User,
} from '../types'
import { DEFAULT_TIMEZONE, TIMEZONE_OPTIONS, formatDateInput, toUtcIso } from '../utils/time'

const Summary: React.FC = () => {
  const [globalData, setGlobalData] = useState<SummaryGlobalResponse | null>(null)
  const [operatorData, setOperatorData] = useState<SummaryOperatorResponse | null>(null)
  const [timeSeries, setTimeSeries] = useState<SummaryTimeSeriesResponse | null>(null)
  const [operators, setOperators] = useState<User[]>([])
  const [operatorId, setOperatorId] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week')
  const [metric, setMetric] = useState<'tympani' | 'hrv' | 'both'>('both')
  const [timezoneOffset, setTimezoneOffset] = useState(DEFAULT_TIMEZONE.offset)
  const [dateFrom, setDateFrom] = useState(formatDateInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
  const [dateTo, setDateTo] = useState(formatDateInput(new Date()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const params = useMemo(() => {
    return {
      from_time: toUtcIso(dateFrom, timezoneOffset, false),
      to_time: toUtcIso(dateTo, timezoneOffset, true),
      operator_id: operatorId || undefined,
    }
  }, [dateFrom, dateTo, timezoneOffset, operatorId])

  useEffect(() => {
    const loadOperators = async () => {
      try {
        const data = await adminAPI.getUsers({ role: 'operator', page: 1, limit: 100 })
        setOperators(data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load operators')
      }
    }
    loadOperators()
  }, [])

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true)
      setError('')
      try {
        const [globalRes, operatorRes, seriesRes] = await Promise.all([
          adminAPI.getSummaryGlobal({ from_time: params.from_time, to_time: params.to_time }),
          adminAPI.getSummaryOperators({ from_time: params.from_time, to_time: params.to_time, operator_id: params.operator_id }),
          adminAPI.getSummaryTimeseries({
            from_time: params.from_time,
            to_time: params.to_time,
            operator_id: params.operator_id,
            group_by: groupBy,
            metric,
          }),
        ])
        setGlobalData(globalRes)
        setOperatorData(operatorRes)
        setTimeSeries(seriesRes)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load summary')
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [params, groupBy, metric])

  const handleExport = async () => {
    const blob = await adminAPI.exportSummaryCsv({
      from_time: params.from_time,
      to_time: params.to_time,
      group_by: groupBy,
      metric,
      operator_id: params.operator_id,
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `summary_${groupBy}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-display">Summary (v2)</h1>
          <p className="text-[var(--text-secondary)]">Rekap data tympani dan HRV per operator</p>
        </div>
        <button
          onClick={handleExport}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-500"
        >
          Export CSV
        </button>
      </div>

      <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Operator</label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">All Operators</option>
              {operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
            <select
              value={timezoneOffset}
              onChange={(e) => setTimezoneOffset(Number(e.target.value))}
              className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.offset} value={tz.offset}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as 'tympani' | 'hrv' | 'both')}
            className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="both">Tympani + HRV</option>
            <option value="tympani">Tympani</option>
            <option value="hrv">HRV</option>
          </select>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {loading && <div className="text-sm text-[var(--text-muted)]">Loading summary...</div>}

      {globalData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-sm">
            <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
            <div className="text-sm text-[var(--text-secondary)]">Tympani Recordings</div>
            <div className="text-2xl font-semibold text-[var(--text-primary)]">{globalData.tympani_count}</div>
          </div>
          <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-sm">
            <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
            <div className="text-sm text-[var(--text-secondary)]">HRV Recordings</div>
            <div className="text-2xl font-semibold text-[var(--text-primary)]">{globalData.hrv_count}</div>
          </div>
          <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] p-5 shadow-sm">
            <div className="h-1 w-10 rounded-full bg-brand-500/80"></div>
            <div className="text-sm text-[var(--text-secondary)]">Active Operators</div>
            <div className="text-2xl font-semibold text-[var(--text-primary)]">{globalData.operators_active}</div>
          </div>
        </div>
      )}

      {operatorData && (
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-soft)] text-sm font-semibold text-[var(--text-secondary)]">
            Summary per Operator
          </div>
          <table className="min-w-full divide-y divide-[var(--border-soft)]">
            <thead className="bg-[var(--surface-alt)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Tympani
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  HRV
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--surface)] divide-y divide-[var(--border-soft)]">
              {operatorData.items.map((item) => (
                <tr key={item.operator_id}>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{item.operator_name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.tympani_count}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.hrv_count}</td>
                </tr>
              ))}
              {!operatorData.items.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-[var(--text-muted)]">
                    No summary data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {timeSeries && (
        <div className="rounded-3xl border border-brand-500/20 bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-soft)] text-sm font-semibold text-[var(--text-secondary)]">
            Time Series ({timeSeries.group_by})
          </div>
          <table className="min-w-full divide-y divide-[var(--border-soft)]">
            <thead className="bg-[var(--surface-alt)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Tympani
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  HRV
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--surface)] divide-y divide-[var(--border-soft)]">
              {timeSeries.series.map((item) => (
                <tr key={item.period}>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{item.period}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.tympani_count}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.hrv_count}</td>
                </tr>
              ))}
              {!timeSeries.series.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-[var(--text-muted)]">
                    No timeseries data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Summary

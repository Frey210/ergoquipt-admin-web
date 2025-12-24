import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import type { User } from '../types'
import { formatDateInput } from '../utils/time'
import { useI18n } from '../utils/i18n'

const DataExport: React.FC = () => {
  const { t } = useI18n()
  const [operators, setOperators] = useState<User[]>([])
  const [operatorId, setOperatorId] = useState('')
  const [dateFrom, setDateFrom] = useState(formatDateInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
  const [dateTo, setDateTo] = useState(formatDateInput(new Date()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportSessions = async () => {
    setLoading(true)
    setError('')
    try {
      const blob = await adminAPI.exportSessionsCsv({
        start_date: dateFrom,
        end_date: dateTo,
        operator_id: operatorId || undefined,
      })
      downloadBlob(blob, `sessions_${dateFrom}_${dateTo}.csv`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to export sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleExportSummary = async () => {
    setLoading(true)
    setError('')
    try {
      const fromIso = new Date(dateFrom).toISOString()
      const toIso = new Date(dateTo).toISOString()
      const blob = await adminAPI.exportSummaryCsv({
        from_time: fromIso,
        to_time: toIso,
        group_by: 'week',
        metric: 'both',
        operator_id: operatorId || undefined,
      })
      downloadBlob(blob, `summary_${dateFrom}_${dateTo}.csv`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to export summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-display">{t('dataExport')}</h1>
        <p className="text-[var(--text-secondary)]">{t('exportDesc')}</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">{t('exportSessions')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t('exportSessionsDesc')}</p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dateFrom')}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dateTo')}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('operator')}</label>
              <select
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm"
              >
                <option value="">{t('allOperators')}</option>
                {operators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleExportSessions}
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {loading ? 'Processing...' : t('downloadCsv')}
          </button>
        </div>

        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">{t('exportSummary')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t('exportSummaryDesc')}</p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dateFrom')}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dateTo')}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleExportSummary}
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] disabled:opacity-60"
          >
            {loading ? 'Processing...' : t('downloadCsv')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataExport

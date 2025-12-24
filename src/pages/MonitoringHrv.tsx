import React, { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../services/api'
import type { HrvBulkRecording, User } from '../types'
import { DEFAULT_TIMEZONE, TIMEZONE_OPTIONS, formatDateInput, toUtcIso } from '../utils/time'

const MonitoringHrv: React.FC = () => {
  const [records, setRecords] = useState<HrvBulkRecording[]>([])
  const [operators, setOperators] = useState<User[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [dateFrom, setDateFrom] = useState(formatDateInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
  const [dateTo, setDateTo] = useState(formatDateInput(new Date()))
  const [operatorId, setOperatorId] = useState('')
  const [timezoneOffset, setTimezoneOffset] = useState(DEFAULT_TIMEZONE.offset)

  const limit = 50

  const params = useMemo(() => {
    return {
      operator_id: operatorId || undefined,
      from_time: toUtcIso(dateFrom, timezoneOffset, false),
      to_time: toUtcIso(dateTo, timezoneOffset, true),
      limit,
      offset,
    }
  }, [operatorId, dateFrom, dateTo, timezoneOffset, offset])

  useEffect(() => {
    const loadOperators = async () => {
      try {
        const data = await adminAPI.getUsers({ role: 'operator' })
        setOperators(data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load operators')
      }
    }
    loadOperators()
  }, [])

  useEffect(() => {
    setOffset(0)
  }, [operatorId, dateFrom, dateTo, timezoneOffset])

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await adminAPI.listHrvRecordings(params)
        setRecords(response?.items || [])
        setTotal(response?.total || 0)
        setSelectedIds([])
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load HRV recordings')
        setRecords([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [params])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleDownloadSingle = async (id: string, format: 'csv' | 'json') => {
    const blob = await adminAPI.downloadHrvRecording(id, format)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hrv_${id}.${format}`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadBulk = async (format: 'csv' | 'json') => {
    if (!selectedIds.length) return
    const blob = await adminAPI.downloadHrvBulk(selectedIds, format)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hrv_bulk.zip'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitoring HRV (v2)</h1>
          <p className="text-gray-600">Bulk HRV recordings submitted by operators</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={timezoneOffset}
              onChange={(e) => setTimezoneOffset(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.offset} value={tz.offset}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Total: {total}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handleDownloadBulk('csv')}
              disabled={!selectedIds.length}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Download CSV (ZIP)
            </button>
            <button
              onClick={() => handleDownloadBulk('json')}
              disabled={!selectedIds.length}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
            >
              Download JSON (ZIP)
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">Loading HRV recordings...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === records.length}
                    onChange={(e) =>
                      setSelectedIds(e.target.checked ? records.map((record) => record.id) : [])
                    }
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respondent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.label}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.operator_name || record.operator_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.respondent?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(record.time_start).toLocaleString()} - {new Date(record.time_end).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.count}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDownloadSingle(record.id, 'csv')}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => handleDownloadSingle(record.id, 'json')}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      JSON
                    </button>
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No HRV recordings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
          disabled={offset === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-sm text-gray-600">
          {offset + 1} - {Math.min(offset + limit, total)} of {total}
        </div>
        <button
          onClick={() => setOffset((prev) => prev + limit)}
          disabled={offset + limit >= total}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default MonitoringHrv

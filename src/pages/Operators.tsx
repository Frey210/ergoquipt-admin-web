import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import type { User } from '../types'

const Operators = () => {
  const [operators, setOperators] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    university: '',
    platform_access: 'mobile' as 'mobile' | 'web' | 'both'
  })

  useEffect(() => {
    loadOperators()
  }, [])

  const loadOperators = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getUsers({ role: 'operator', page: 1, limit: 100 })
      setOperators(data)
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to load operators')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await adminAPI.createUser({ ...formData, role: 'operator' })
      setTempPassword(response.temporary_password)
      setShowCreateModal(false)
      setFormData({
        username: '',
        email: '',
        full_name: '',
        university: '',
        platform_access: 'mobile'
      })
      loadOperators()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create operator')
    }
  }

  const handleResetPassword = async (operator: User) => {
    const confirmed = window.confirm(`Reset password for ${operator.full_name}?`)
    if (!confirmed) return
    setActionError('')
    setActionMessage('')
    setActionLoading((prev) => ({ ...prev, [operator.id]: true }))
    try {
      const response = await adminAPI.resetUserPassword(operator.id)
      setTempPassword(response.temporary_password)
      setActionMessage(`Temporary password generated for ${operator.full_name}.`)
      await loadOperators()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to reset password')
    } finally {
      setActionLoading((prev) => ({ ...prev, [operator.id]: false }))
    }
  }

  const handleToggleStatus = async (operator: User) => {
    const nextStatus = operator.status === 'active' ? 'inactive' : 'active'
    const confirmed = window.confirm(`Set ${operator.full_name} to ${nextStatus}?`)
    if (!confirmed) return
    setActionError('')
    setActionMessage('')
    setActionLoading((prev) => ({ ...prev, [operator.id]: true }))
    try {
      await adminAPI.updateUserStatus(operator.id, { status: nextStatus })
      setActionMessage(`${operator.full_name} is now ${nextStatus}.`)
      await loadOperators()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to update status')
    } finally {
      setActionLoading((prev) => ({ ...prev, [operator.id]: false }))
    }
  }

  const handleDeleteOperator = async (operator: User) => {
    const confirmed = window.confirm(`Delete operator ${operator.full_name}? This will remove all related data.`)
    if (!confirmed) return
    setActionError('')
    setActionMessage('')
    setActionLoading((prev) => ({ ...prev, [operator.id]: true }))
    try {
      await adminAPI.deleteOperator(operator.id)
      setActionMessage(`${operator.full_name} deleted.`)
      await loadOperators()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to delete operator')
    } finally {
      setActionLoading((prev) => ({ ...prev, [operator.id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Operators Management</h1>
          <p className="text-gray-600">Manage system operators and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Operator
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {tempPassword && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Temporary password: <span className="font-semibold">{tempPassword}</span>
        </div>
      )}

      {actionMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                  Loading operators...
                </td>
              </tr>
            ) : (
              operators.map((operator) => (
                <tr key={operator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {operator.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {operator.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {operator.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      operator.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {operator.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(operator.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleResetPassword(operator)}
                        disabled={actionLoading[operator.id]}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {actionLoading[operator.id] ? 'Working...' : 'Reset Password'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(operator)}
                        disabled={actionLoading[operator.id]}
                        className={operator.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                      >
                        {actionLoading[operator.id] ? 'Working...' : operator.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteOperator(operator)}
                        disabled={actionLoading[operator.id]}
                        className="text-red-600 hover:text-red-800"
                      >
                        {actionLoading[operator.id] ? 'Working...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && operators.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                  No operators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Operator</h2>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Access</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.platform_access}
                  onChange={(e) => setFormData({ ...formData, platform_access: e.target.value as 'mobile' | 'web' | 'both' })}
                >
                  <option value="mobile">Mobile</option>
                  <option value="web">Web</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Operators

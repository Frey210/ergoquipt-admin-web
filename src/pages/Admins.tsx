import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { adminAPI } from '../services/api'
import type { User } from '../types'

const Admins: React.FC = () => {
  const { user } = useAuthStore()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [tempPassword, setTempPassword] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    university: '',
    platform_access: 'web' as 'mobile' | 'web' | 'both',
  })

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadAdmins()
    }
  }, [])

  if (user?.role !== 'super_admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-gray-800">Access denied</h1>
        <p className="text-gray-600 mt-2">Only super admin can manage admin accounts.</p>
      </div>
    )
  }

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getUsers({ role: 'admin', page: 1, limit: 100 })
      setAdmins(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await adminAPI.createUser({
        ...formData,
        role: 'admin',
      })
      setTempPassword(response.temporary_password)
      setShowCreateModal(false)
      setFormData({
        username: '',
        email: '',
        full_name: '',
        university: '',
        platform_access: 'web',
      })
      loadAdmins()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create admin')
    }
  }

  const handleResetPassword = async (admin: User) => {
    const confirmed = window.confirm(`Reset password for ${admin.full_name}?`)
    if (!confirmed) return
    setActionError('')
    setActionMessage('')
    setActionLoading((prev) => ({ ...prev, [admin.id]: true }))
    try {
      const response = await adminAPI.resetAdminPassword(admin.id)
      setTempPassword(response.temporary_password)
      setActionMessage(`Temporary password generated for ${admin.full_name}.`)
      await loadAdmins()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to reset password')
    } finally {
      setActionLoading((prev) => ({ ...prev, [admin.id]: false }))
    }
  }

  const handleToggleStatus = async (admin: User) => {
    if (admin.id === user?.id) {
      setActionError('You cannot update your own status.')
      return
    }
    const nextStatus = admin.status === 'active' ? 'inactive' : 'active'
    const confirmed = window.confirm(`Set ${admin.full_name} to ${nextStatus}?`)
    if (!confirmed) return
    setActionError('')
    setActionMessage('')
    setActionLoading((prev) => ({ ...prev, [admin.id]: true }))
    try {
      await adminAPI.updateAdminStatus(admin.id, { status: nextStatus })
      setActionMessage(`${admin.full_name} is now ${nextStatus}.`)
      await loadAdmins()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to update status')
    } finally {
      setActionLoading((prev) => ({ ...prev, [admin.id]: false }))
    }
  }

  const handleDelete = async (admin: User) => {
    if (admin.id === user?.id) {
      setError('You cannot delete your own account.')
      return
    }
    const confirmed = window.confirm(`Delete admin ${admin.full_name}? This will delete all operators under them.`)
    if (!confirmed) return
    setActionError('')
    setActionMessage('')
    setActionLoading((prev) => ({ ...prev, [admin.id]: true }))
    try {
      await adminAPI.deleteAdmin(admin.id)
      setActionMessage(`${admin.full_name} deleted.`)
      await loadAdmins()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to delete admin')
    } finally {
      setActionLoading((prev) => ({ ...prev, [admin.id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admins Management</h1>
          <p className="text-gray-600">Manage administrator accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Admin
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      {actionError && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">{actionError}</div>}
      {actionMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          {actionMessage}
        </div>
      )}
      {tempPassword && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Temporary password: <span className="font-semibold">{tempPassword}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
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
                  Loading admins...
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {admin.full_name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.full_name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleResetPassword(admin)}
                        disabled={actionLoading[admin.id]}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {actionLoading[admin.id] ? 'Working...' : 'Reset Password'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        disabled={actionLoading[admin.id]}
                        className={admin.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                      >
                        {actionLoading[admin.id] ? 'Working...' : admin.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={actionLoading[admin.id]}
                        className="text-red-600 hover:text-red-800"
                      >
                        {actionLoading[admin.id] ? 'Working...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Admin</h2>
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platform_access: e.target.value as 'mobile' | 'web' | 'both',
                    })
                  }
                >
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
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admins

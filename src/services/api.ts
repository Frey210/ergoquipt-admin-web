import axios from 'axios'
import type {
  User,
  LoginRequest,
  LoginResponse,
  ListResponse,
  TympaniBulkRecording,
  HrvBulkRecording,
  SummaryOperatorResponse,
  SummaryTimeSeriesResponse,
  SummaryGlobalResponse,
} from '../types'

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const withBase = (path: string) => (API_ORIGIN ? `${API_ORIGIN}${path}` : path)

export const apiV1 = axios.create({
  baseURL: withBase('/api/v1'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export const apiV2 = axios.create({
  baseURL: withBase('/api/v2'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export const apiRoot = axios.create({
  baseURL: API_ORIGIN || '/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Auth endpoints
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiV1.post('/auth/login', credentials)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiV1.get('/auth/me')
    return response.data
  },
}

// Admin endpoints
export const adminAPI = {
  getUsers: async (params?: {
    role?: string
    status_filter?: string
    created_by?: string
    page?: number
    limit?: number
  }): Promise<User[]> => {
    const response = await apiV1.get('/admin/users', { params })
    return response.data
  },

  createUser: async (payload: {
    username: string
    email: string
    full_name: string
    university?: string
    role: 'operator' | 'admin'
    platform_access: 'mobile' | 'web' | 'both'
  }): Promise<{
    id: string
    username: string
    email: string
    full_name: string
    temporary_password: string
    status: string
    created_at: string
  }> => {
    const response = await apiV1.post('/admin/users/register', payload)
    return response.data
  },

  updateUserStatus: async (id: string, payload: { status: string; reason?: string }): Promise<void> => {
    await apiV1.patch(`/admin/users/${id}/status`, payload)
  },

  resetUserPassword: async (id: string): Promise<{ temporary_password: string }> => {
    const response = await apiV1.post(`/admin/users/${id}/reset-password`)
    return response.data
  },

  deleteOperator: async (id: string): Promise<void> => {
    await apiV1.delete(`/admin/operators/${id}`)
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await apiV1.delete(`/admin/admins/${id}`)
  },

  updateAdminStatus: async (id: string, payload: { status: string; reason?: string }): Promise<void> => {
    await apiV1.patch(`/admin/admins/${id}/status`, payload)
  },

  resetAdminPassword: async (id: string): Promise<{ temporary_password: string }> => {
    const response = await apiV1.post(`/admin/admins/${id}/reset-password`)
    return response.data
  },

  listTympaniRecordings: async (params: {
    operator_id?: string
    from_time?: string
    to_time?: string
    limit?: number
    offset?: number
  }): Promise<ListResponse<TympaniBulkRecording>> => {
    const response = await apiV2.get('/admin/tympani/recordings', { params })
    return response.data
  },

  downloadTympaniRecording: async (recordingId: string, format: 'csv' | 'json'): Promise<Blob> => {
    const response = await apiV2.get(`/admin/tympani/recordings/${recordingId}/download`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  downloadTympaniBulk: async (recordingIds: string[], format: 'csv' | 'json'): Promise<Blob> => {
    const response = await apiV2.post(
      '/admin/tympani/recordings/download',
      { recording_ids: recordingIds, format },
      { responseType: 'blob' }
    )
    return response.data
  },

  listHrvRecordings: async (params: {
    operator_id?: string
    from_time?: string
    to_time?: string
    limit?: number
    offset?: number
  }): Promise<ListResponse<HrvBulkRecording>> => {
    const response = await apiV2.get('/admin/hrv/recordings', { params })
    return response.data
  },

  downloadHrvRecording: async (recordingId: string, format: 'csv' | 'json'): Promise<Blob> => {
    const response = await apiV2.get(`/admin/hrv/recordings/${recordingId}/download`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  downloadHrvBulk: async (recordingIds: string[], format: 'csv' | 'json'): Promise<Blob> => {
    const response = await apiV2.post(
      '/admin/hrv/recordings/download',
      { recording_ids: recordingIds, format },
      { responseType: 'blob' }
    )
    return response.data
  },

  getSummaryOperators: async (params: {
    from_time: string
    to_time: string
    operator_id?: string
  }): Promise<SummaryOperatorResponse> => {
    const response = await apiV2.get('/admin/summary/operators', { params })
    return response.data
  },

  getSummaryTimeseries: async (params: {
    from_time: string
    to_time: string
    group_by: 'day' | 'week' | 'month'
    metric?: 'tympani' | 'hrv' | 'both'
    operator_id?: string
  }): Promise<SummaryTimeSeriesResponse> => {
    const response = await apiV2.get('/admin/summary/timeseries', { params })
    return response.data
  },

  getSummaryGlobal: async (params: { from_time: string; to_time: string }): Promise<SummaryGlobalResponse> => {
    const response = await apiV2.get('/admin/summary/global', { params })
    return response.data
  },

  exportSummaryCsv: async (params: {
    from_time: string
    to_time: string
    group_by: 'day' | 'week' | 'month'
    metric?: 'tympani' | 'hrv' | 'both'
    operator_id?: string
  }): Promise<Blob> => {
    const response = await apiV2.get('/admin/summary/export.csv', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  exportSessionsCsv: async (params: {
    start_date: string
    end_date: string
    operator_id?: string
    test_type?: string
  }): Promise<Blob> => {
    const response = await apiV1.get('/admin/export/sessions.csv', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}

// System health
export const systemAPI = {
  healthCheck: async (): Promise<any> => {
    const response = await apiRoot.get('/health')
    return response.data
  },
}

// Interceptors
const attachAuth = (client: typeof apiV1) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('ergoquipt_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('ergoquipt_token')
        localStorage.removeItem('ergoquipt_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

attachAuth(apiV1)
attachAuth(apiV2)

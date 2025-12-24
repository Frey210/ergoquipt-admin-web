// src/App.tsx - Updated
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth-store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Operators from './pages/Operators'
import Admins from './pages/Admins'
import Sessions from './pages/Sessions'
import Respondents from './pages/Respondents'
import Analytics from './pages/Analytics'
import MonitoringTympani from './pages/MonitoringTympani'
import MonitoringHrv from './pages/MonitoringHrv'
import Summary from './pages/Summary'
import Settings from './pages/Settings'
import DataExport from './pages/DataExport'
import AppLayout from './components/layout/AppLayout'
import { authAPI } from './services/api'

// Placeholder components
const SessionDetailPage = () => <div className="p-6">Session Detail - Coming Soon</div>

function App() {
  const { isAuthenticated, login, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('ergoquipt_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const profile = await authAPI.getProfile()
        login(token, profile)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [login, logout])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">EQ</span>
          </div>
          <p className="text-gray-600 font-medium">Ergoquipt Admin</p>
          <p className="text-sm text-gray-500 mt-1">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
        />
        
        {isAuthenticated ? (
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/operators" element={<Operators />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetailPage />} />
            <Route path="/respondents" element={<Respondents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/monitoring/tympani" element={<MonitoringTympani />} />
            <Route path="/monitoring/hrv" element={<MonitoringHrv />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/export" element={<DataExport />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  )
}

export default App

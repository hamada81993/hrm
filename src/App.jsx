import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Payroll from './pages/Payroll'
import Leaves from './pages/Leaves'
import Documents from './pages/Documents'
import ExpiryManagement from './pages/ExpiryManagement'
import Attendance from './pages/Attendance'
import OtherPayments from './pages/OtherPayments'
import Custodies from './pages/Custodies'
import Login from './pages/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Layout setIsAuthenticated={setIsAuthenticated}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/expiry" element={<ExpiryManagement />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/other-payments" element={<OtherPayments />} />
              <Route path="/custodies" element={<Custodies />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  )
}

export default App


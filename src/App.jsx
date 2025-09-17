import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import HomePage from './components/HomePage'
import UsersPage from './components/UsersPage'
import InquiriesPage from './components/InquiriesPage'
import MeetingsPage from './components/MeetingsPage'
import ProjectsPage from './components/ProjectsPage'
import PricingPage from './components/PricingPage'
import ProductionPage from './components/ProductionPage'
import FactoryPage from './components/FactoryPage'
import RolesPage from './components/RolesPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // localStorage'dan kullanıcı bilgisini kontrol et
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    // localStorage'a kullanıcı bilgisini kaydet
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    // localStorage-dan istifadəçi məlumatını sil
    localStorage.removeItem('currentUser')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #fff',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="app">
        <Dashboard user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/inquiries" element={<InquiriesPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/factory" element={<FactoryPage />} />
            <Route path="/roles" element={<RolesPage />} />
          </Routes>
        </Dashboard>
      </div>
    </Router>
  )
}

export default App

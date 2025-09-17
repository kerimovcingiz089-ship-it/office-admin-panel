import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Phone, 
  Settings, 
  LogOut, 
  Home,
  User,
  ChevronDown,
  Menu,
  X,
  FolderOpen,
  Factory
} from 'lucide-react'

function Dashboard({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const location = useLocation()

  const navigationItems = [
    { path: '/dashboard', name: 'Ana Sayfa', icon: Home },
    { path: '/users', name: 'İstifadəçilər', icon: Users },
    { path: '/inquiries', name: 'Sorğular', icon: FileText },
    { path: '/meetings', name: 'Görüşmələr', icon: Calendar },
    { path: '/projects', name: 'Layihələndirmə', icon: FolderOpen },
    { path: '/pricing', name: 'Qiymətləndirmə', icon: TrendingUp },
    { path: '/production', name: 'İstehsal planlaması', icon: Factory },
    { path: '/factory', name: 'Fabrik', icon: Factory },
    { path: '/roles', name: 'Rollar', icon: Settings }
  ]

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // İstifadəçinin rolunu əldə et
  const getUserRole = (user) => {
    if (!user || !user.roleId) return 'Rol yoxdur'
    
    const roles = JSON.parse(localStorage.getItem('officeRoles') || '[]')
    const role = roles.find(r => r.id === parseInt(user.roleId))
    return role ? role.name : 'Rol yoxdur'
  }

  const handleLogout = () => {
    onLogout()
    setProfileDropdownOpen(false)
  }

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Modern Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} style={{
        width: sidebarOpen ? '340px' : '80px',
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        height: '100vh',
        zIndex: 1000,
        overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Sidebar Header */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                position: 'relative'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid #1e293b'
                }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#f8fafc' }}>Ofis İdarəetməsi</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7, color: '#cbd5e1' }}>Deposist MMC</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '16px 0', flex: 1 }}>
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  color: isActive ? '#1e293b' : '#e2e8f0',
                  textDecoration: 'none',
                  background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
                  borderRadius: isActive ? '12px' : '0',
                  margin: '0 8px 6px 8px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  fontWeight: isActive ? '600' : '500',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.color = '#f8fafc'
                    e.target.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = '#e2e8f0'
                    e.target.style.transform = 'translateX(0)'
                  }
                }}
              >
                <Icon size={20} style={{ marginRight: sidebarOpen ? '16px' : '0' }} />
                {sidebarOpen && (
                  <span style={{ fontSize: '0.95rem' }}>
                    {item.name}
                  </span>
                )}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    width: '6px',
                    height: '6px',
                    background: '#f8fafc',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(248, 250, 252, 0.5)'
                  }} />
                )}
                {!isActive && (
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    bottom: '0',
                    width: '3px',
                    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '0 2px 2px 0',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}


        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '0',
          width: '1px',
          height: '200px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          transform: 'translateY(-50%)'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20px',
          width: '40px',
          height: '40px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(20px)'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '20px',
          width: '30px',
          height: '30px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          filter: 'blur(15px)'
        }} />
      </div>

        {/* Page Content */}
        <main style={{ 
          padding: '0',
          width: '100%',
          boxSizing: 'border-box',
          height: '100vh',
          overflowY: 'auto',
          background: '#f5f7fa'
        }}>
          {/* Top Header */}
          <header style={{
            background: 'white',
            padding: '10px 15px',
            borderBottom: '1px solid #e1e5e9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '100%',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                color: '#333',
                fontWeight: '600'
              }}>
                {navigationItems.find(item => item.path === location.pathname)?.name || 'Ana Sayfa'}
              </h1>
            </div>

            {/* Profile Section */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,249,250,1) 100%)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  marginRight: '14px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'rotate(45deg)'
                  }} />
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    {getInitials(user?.name || 'User')}
                  </span>
                </div>
                <div style={{ textAlign: 'left', marginRight: '12px', flex: 1 }}>
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#1a202c',
                    fontSize: '0.95rem',
                    marginBottom: '3px',
                    lineHeight: '1.2'
                  }}>
                    {user?.name || 'İstifadəçi'}
                  </div>
                  <div style={{ 
                    color: '#4a5568',
                    fontSize: '0.8rem',
                    marginBottom: '2px',
                    fontWeight: '500',
                    lineHeight: '1.2'
                  }}>
                    {user?.position || 'Vəzifə təyin edilməyib'}
                  </div>
                  <div style={{ 
                    color: '#718096',
                    fontSize: '0.75rem',
                    fontWeight: '400',
                    lineHeight: '1.2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }} />
                    {getUserRole(user)}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(102, 126, 234, 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <ChevronDown size={14} color="#667eea" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 1000,
                  marginTop: '8px'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #e1e5e9' }}>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                      {user?.name || 'İstifadəçi'}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>
                      {user?.email || 'email@example.com'}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '4px' }}>
                      Vəzifə: {user?.position || 'Vəzifə təyin edilməyib'}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                      Rol: {user?.role?.name || 'Rol yoxdur'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc3545',
                        fontSize: '0.9rem',
                        transition: 'background 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <LogOut size={16} style={{ marginRight: '8px' }} />
                      Çıxış Et
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content Area */}
          <div style={{ padding: '20px' }}>
            {children}
          </div>
        </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0 !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard

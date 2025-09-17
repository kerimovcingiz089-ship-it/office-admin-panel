import React, { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Xəta mesajını təmizlə
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // localStorage-dan istifadəçiləri al
    const savedUsers = localStorage.getItem('officeUsers')
    let users = []
    
    if (savedUsers) {
      users = JSON.parse(savedUsers)
    } else {
      // Əgər localStorage-da istifadəçi yoxdursa, standart istifadəçiləri yarat
      users = [
        {
          id: 1,
          name: 'Əhməd Yılmaz',
          email: 'ahmed@ofis.com',
          password: '123456',
          department: 'İnformasiya Texnologiyaları',
          position: 'Proqram Tərtibatçısı',
          status: 'active',
          roleId: 1, // Admin
          joinDate: '2023-01-15'
        },
        {
          id: 2,
          name: 'Aysu Kərimli',
          email: 'aysu@ofis.com',
          password: '123456',
          department: 'Müştəri Xidmətləri',
          position: 'Müştəri Xidmətləri Mütəxəssisi',
          status: 'active',
          roleId: 2, // Müştəri Xidmətləri
          joinDate: '2022-08-20'
        },
        {
          id: 3,
          name: 'Məhəmməd Əliyev',
          email: 'mehemmed@ofis.com',
          password: '123456',
          department: 'Layihə İdarəetməsi',
          position: 'Layihə Meneceri',
          status: 'active',
          roleId: 3, // Layihə Meneceri
          joinDate: '2021-12-10'
        }
      ]
      localStorage.setItem('officeUsers', JSON.stringify(users))
    }

    // Rolları da localStorage-a yadda saxla (əgər yoxdursa)
    const savedRoles = localStorage.getItem('officeRoles')
    if (!savedRoles) {
      const defaultRoles = [
        {
          id: 1,
          name: 'Admin',
          description: 'Tam səlahiyyətli administrator',
          permissions: {
            dashboard: true,
            users: true,
            inquiries: true,
            meetings: true,
            projects: true,
            pricing: true,
            roles: true
          },
          isDefault: true
        },
        {
          id: 2,
          name: 'Müştəri Xidmətləri',
          description: 'Sorğular və görüşlər üçün',
          permissions: {
            dashboard: true,
            users: false,
            inquiries: true,
            meetings: true,
            projects: false,
            pricing: false,
            roles: false
          },
          isDefault: true
        },
        {
          id: 3,
          name: 'Layihə Meneceri',
          description: 'Layihələndirmə və qiymətləndirmə üçün',
          permissions: {
            dashboard: true,
            users: false,
            inquiries: false,
            meetings: false,
            projects: true,
            pricing: true,
            roles: false
          },
          isDefault: true
        }
      ]
      localStorage.setItem('officeRoles', JSON.stringify(defaultRoles))
    }

    // Kullanıcıyı bul
    const user = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.password === formData.password
    )

    setTimeout(() => {
      setLoading(false)
      
      if (user) {
        if (user.status === 'active') {
          // Rol bilgisini al
          const roles = JSON.parse(localStorage.getItem('officeRoles') || '[]')
          const userRole = roles.find(role => role.id === user.roleId)
          
          const userData = {
            ...user,
            role: userRole
          }
          
          onLogin(userData)
        } else {
          setError('Hesabınız aktiv deyil!')
        }
      } else {
        setError('Email və ya şifrə yanlışdır!')
      }
    }, 1000) // 1 saniye loading göster
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '2rem'
          }}>
            🏢
          </div>
          <h1 style={{ 
            color: '#333', 
            margin: '0 0 10px 0',
            fontSize: '1.8rem',
            fontWeight: '600'
          }}>
            Ofis İdarəetməsi
          </h1>
          <p style={{ 
            color: '#666', 
            margin: 0,
            fontSize: '0.9rem'
          }}>
            Sistemə daxil olmaq üçün məlumatlarınızı daxil edin
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#333', 
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              E-poçt
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="E-poçt adresinizi daxil edin"
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#333', 
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Şifrə
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '50px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                placeholder="Şifrənizi daxil edin"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Giriş edilir...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Giriş Et
              </>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Test Hesabları:</h4>
          <div style={{ marginBottom: '8px' }}>
            <strong>Admin:</strong> ahmed@ofis.com / 123456
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Müştəri Xidmətləri:</strong> aysu@ofis.com / 123456
          </div>
          <div>
            <strong>Layihə Meneceri:</strong> mehemmed@ofis.com / 123456
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default LoginPage

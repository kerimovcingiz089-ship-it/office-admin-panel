import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'

function UsersPage() {
  // localStorage-dan veriləri yüklə və ya standart veriləri istifadə et
  const getInitialUsers = () => {
    const savedUsers = localStorage.getItem('officeUsers')
    if (savedUsers) {
      return JSON.parse(savedUsers)
    }
    // İlk dəfə açıldığında standart verilər
    return [
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
  }

  const [users, setUsers] = useState(getInitialUsers)

  // Rolları localStorage-a yadda saxla (əgər yoxdursa)
  useEffect(() => {
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
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Rolları localStorage-dan al
  const getRoles = () => {
    const savedRoles = localStorage.getItem('officeRoles')
    if (savedRoles) {
      return JSON.parse(savedRoles)
    }
    // Əgər localStorage-da rollar yoxdursa, standart rolları qaytar
    return [
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
  }

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '123456', // Standart şifrə
    department: '',
    position: '',
    status: 'active',
    roleId: '2' // Standart olaraq "Müştəri Xidmətləri" rolunu təyin et
  })

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.department && newUser.position && newUser.roleId) {
      const userToAdd = {
        ...newUser,
        id: Math.max(...users.map(u => u.id)) + 1,
        joinDate: new Date().toISOString().split('T')[0]
      }
      const updatedUsers = [...users, userToAdd]
      setUsers(updatedUsers)
      // localStorage-a yadda saxla
      localStorage.setItem('officeUsers', JSON.stringify(updatedUsers))
      setNewUser({
        name: '',
        email: '',
        password: '123456', // Varsayılan şifre
        department: '',
        position: '',
        status: 'active',
        roleId: ''
      })
      setShowAddModal(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position,
      status: user.status,
              roleId: user.roleId || '2'
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = () => {
    if (newUser.name && newUser.email && newUser.department && newUser.position && newUser.roleId) {
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, ...newUser } : user
      )
      setUsers(updatedUsers)
      // localStorage-a yadda saxla
      localStorage.setItem('officeUsers', JSON.stringify(updatedUsers))
      setShowEditModal(false)
      setSelectedUser(null)
      setNewUser({
        name: '',
        email: '',
        password: '123456', // Varsayılan şifre
        department: '',
        position: '',
        status: 'active',
        roleId: ''
      })
    }
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = () => {
    const updatedUsers = users.filter(user => user.id !== selectedUser.id)
    setUsers(updatedUsers)
    // localStorage-a yadda saxla
    localStorage.setItem('officeUsers', JSON.stringify(updatedUsers))
    setShowDeleteModal(false)
    setSelectedUser(null)
  }

  return (
    <div>

      <div className="users-section">
        <div className="users-header">
          <h3>İşçi Siyahısı</h3>
          <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Yeni İstifadəçi Əlavə Et
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} />
            <input
              type="text"
              placeholder="İstifadəçi axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>İstifadəçi</th>
              <th>E-poçt</th>
              <th>Şöbə</th>
              <th>Vəzifə</th>
              <th>Rol</th>
              <th>Vəziyyət</th>
              <th>Qoşulma Tarixi</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="user-avatar">
                      {getInitials(user.name)}
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>{user.position}</td>
                <td>
                  {user.roleId ? (
                    <span style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {getRoles().find(role => Number(role.id) === Number(user.roleId))?.name || 'Bilinməyən Rol'}
                    </span>
                  ) : (
                    <span style={{
                      background: '#f5f5f5',
                      color: '#666',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      Rol yoxdur
                    </span>
                  )}
                </td>
                <td>
                  <span className={`user-status ${user.status}`}>
                    {user.status === 'active' ? 'Aktiv' : 'Passiv'}
                  </span>
                </td>
                <td>{new Date(user.joinDate).toLocaleDateString('az-AZ')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditUser(user)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Axtarış kriterlərinə uyğun istifadəçi tapılmadı.
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginTop: '30px' 
      }}>
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {users.length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi İstifadəçi</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {users.filter(u => u.status === 'active').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Aktiv İstifadəçi</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {users.filter(u => u.status === 'inactive').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Passiv İstifadəçi</div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni İstifadəçi Əlavə Et</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <X />
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Ad Soyad *
              </label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Ad Soyad giriniz"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                E-poçt *
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="E-posta adresi giriniz"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Şifrə *
              </label>
              <input
                type="text"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Şifrə giriniz (varsayılan: 123456)"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Departman *
              </label>
              <select
                name="department"
                value={newUser.department}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="">Departman seçiniz</option>
                <option value="Bilgi İşlem">Bilgi İşlem</option>
                <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                <option value="Muhasebe">Muhasebe</option>
                <option value="Pazarlama">Pazarlama</option>
                <option value="Satış">Satış</option>
                <option value="Üretim">Üretim</option>
                <option value="Kalite Kontrol">Kalite Kontrol</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Pozisyon *
              </label>
              <input
                type="text"
                name="position"
                value={newUser.position}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Pozisyon giriniz"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Rol
              </label>
              <select
                name="roleId"
                value={newUser.roleId}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="">Rol seçin *</option>
                {getRoles().map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Durum
              </label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Ləğv Et
              </button>
              <button
                onClick={handleAddUser}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                İstifadəçi Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>İstifadəçini Redaktə Et</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <X />
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Ad Soyad *
              </label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Ad Soyad giriniz"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                E-posta *
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="E-posta adresi giriniz"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Departman *
              </label>
              <select
                name="department"
                value={newUser.department}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="">Departman seçiniz</option>
                <option value="Bilgi İşlem">Bilgi İşlem</option>
                <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                <option value="Muhasebe">Muhasebe</option>
                <option value="Pazarlama">Pazarlama</option>
                <option value="Satış">Satış</option>
                <option value="Üretim">Üretim</option>
                <option value="Kalite Kontrol">Kalite Kontrol</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Pozisyon *
              </label>
              <input
                type="text"
                name="position"
                value={newUser.position}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Pozisyon giriniz"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Rol
              </label>
              <select
                name="roleId"
                value={newUser.roleId}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="">Rol seçin</option>
                {getRoles().map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Durum
              </label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Ləğv Et
              </button>
              <button
                onClick={handleUpdateUser}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Yenilə
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#dc3545',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                ⚠️
              </div>
              <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>İstifadəçini Sil</h2>
              <p style={{ color: '#666', margin: 0 }}>
                <strong>{selectedUser.name}</strong> istifadəçisini silmək istədiyinizə əminsinizmi?
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                Bu əməliyyat geri qaytarıla bilməz.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Ləğv Et
              </button>
              <button
                onClick={confirmDeleteUser}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#dc3545',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage

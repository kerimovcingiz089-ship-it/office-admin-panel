import React, { useState } from 'react'
import { Plus, Edit, Trash2, Search, X, Shield, Users, FileText, Calendar, TrendingUp, DollarSign, Eye, EyeOff } from 'lucide-react'

function RolesPage() {
  // localStorage-dan rollar verilərini yüklə
  const getInitialRoles = () => {
    const savedRoles = localStorage.getItem('officeRoles')
    if (savedRoles) {
      return JSON.parse(savedRoles)
    }
    // Standart rollar
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

  const [roles, setRoles] = useState(getInitialRoles)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {
      dashboard: false,
      users: false,
      inquiries: false,
      meetings: false,
      projects: false,
      pricing: false,
      roles: false
    }
  })

  const sections = [
    { key: 'dashboard', name: 'Ana Səhifə', icon: <TrendingUp size={16} /> },
    { key: 'users', name: 'İstifadəçilər', icon: <Users size={16} /> },
    { key: 'inquiries', name: 'Sorğular', icon: <FileText size={16} /> },
    { key: 'meetings', name: 'Görüşlər', icon: <Calendar size={16} /> },
    { key: 'projects', name: 'Layihələndirmə', icon: <TrendingUp size={16} /> },
    { key: 'pricing', name: 'Qiymətləndirmə', icon: <DollarSign size={16} /> },
    { key: 'roles', name: 'Rollar', icon: <Shield size={16} /> }
  ]

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewRole(prev => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (permission) => {
    setNewRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }))
  }

  const handleAddRole = () => {
    if (newRole.name.trim()) {
      const roleToAdd = {
        ...newRole,
        id: Math.max(...roles.map(r => r.id), 0) + 1,
        createdAt: new Date().toISOString(),
        isDefault: false
      }
      const updatedRoles = [...roles, roleToAdd]
      setRoles(updatedRoles)
      localStorage.setItem('officeRoles', JSON.stringify(updatedRoles))
      setNewRole({
        name: '',
        description: '',
        permissions: {
          dashboard: false,
          users: false,
          inquiries: false,
          meetings: false,
          projects: false,
          pricing: false,
          roles: false
        }
      })
      setShowAddModal(false)
    }
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setNewRole({ ...role })
    setShowEditModal(true)
  }

  const handleUpdateRole = () => {
    if (newRole.name.trim()) {
      const updatedRoles = roles.map(role =>
        role.id === selectedRole.id ? { ...newRole, id: selectedRole.id, isDefault: selectedRole.isDefault } : role
      )
      setRoles(updatedRoles)
      localStorage.setItem('officeRoles', JSON.stringify(updatedRoles))
      setShowEditModal(false)
      setSelectedRole(null)
      setNewRole({
        name: '',
        description: '',
        permissions: {
          dashboard: false,
          users: false,
          inquiries: false,
          meetings: false,
          projects: false,
          pricing: false,
          roles: false
        }
      })
    }
  }

  const handleDeleteRole = (role) => {
    setSelectedRole(role)
    setShowDeleteModal(true)
  }

  const confirmDeleteRole = () => {
    // Varsayılan rolları silməyə icazə vermə
    if (selectedRole.isDefault) {
      alert('Varsayılan rollar silinə bilməz!')
      setShowDeleteModal(false)
      setSelectedRole(null)
      return
    }

    // Bu rolun istifadəçilər tərəfindən istifadə edilip edilmədiyini yoxla
    const savedUsers = localStorage.getItem('officeUsers')
    if (savedUsers) {
      const users = JSON.parse(savedUsers)
      const usersWithRole = users.filter(user => user.roleId === selectedRole.id)
      if (usersWithRole.length > 0) {
        alert(`Bu rol ${usersWithRole.length} istifadəçi tərəfindən istifadə edilir. Əvvəlcə bu istifadəçilərin rolunu dəyişdirin.`)
        setShowDeleteModal(false)
        setSelectedRole(null)
        return
      }
    }

    const updatedRoles = roles.filter(role => role.id !== selectedRole.id)
    setRoles(updatedRoles)
    localStorage.setItem('officeRoles', JSON.stringify(updatedRoles))
    setShowDeleteModal(false)
    setSelectedRole(null)
  }

  const getPermissionCount = (permissions) => {
    return Object.values(permissions).filter(Boolean).length
  }

  return (
    <div>

      <div className="users-section">
        <div className="users-header">
          <h3>Rol Siyahısı</h3>
          <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Yeni Rol Əlavə Et
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
              placeholder="Rol axtar..."
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
              <th>Rol Adı</th>
              <th>Təsvir</th>
              <th>Səlahiyyətlər</th>
              <th>Tip</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map(role => (
              <tr key={role.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="user-avatar" style={{ background: role.isDefault ? '#28a745' : '#007bff' }}>
                      <Shield size={16} color="white" />
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {role.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        ID: {role.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{role.description}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ 
                      background: '#e9ecef', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      color: '#495057'
                    }}>
                      {getPermissionCount(role.permissions)} səlahiyyət
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {sections.map(section => (
                        <div
                          key={section.key}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: role.permissions[section.key] ? '#28a745' : '#dee2e6'
                          }}
                          title={`${section.name}: ${role.permissions[section.key] ? 'Aktiv' : 'Deaktiv'}`}
                        />
                      ))}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`user-status ${role.isDefault ? 'active' : 'pending'}`}>
                    {role.isDefault ? 'Varsayılan' : 'Xüsusi'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    {!role.isDefault && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="action-btn delete-btn"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Axtarış kriterlərinə uyğun rol tapılmadı.
          </div>
        )}
      </div>

      {/* Dashboard Cards for Roles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {roles.length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi Rol</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {roles.filter(r => r.isDefault).length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Varsayılan Rol</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {roles.filter(r => !r.isDefault).length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Xüsusi Rol</div>
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni Rol Əlavə Et</h2>
              <button
                onClick={() => { 
                  setShowAddModal(false); 
                  setNewRole({
                    name: '',
                    description: '',
                    permissions: {
                      dashboard: false,
                      users: false,
                      inquiries: false,
                      meetings: false,
                      projects: false,
                      pricing: false,
                      roles: false
                    }
                  })
                }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                <X />
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Rol Adı *
              </label>
              <input
                type="text"
                name="name"
                value={newRole.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Rol adını daxil edin"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Təsvir
              </label>
              <textarea
                name="description"
                value={newRole.description}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Rol təsvirini daxil edin"
              ></textarea>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
                Səlahiyyətlər
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '10px' 
              }}>
                {sections.map(section => (
                  <div
                    key={section.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: newRole.permissions[section.key] ? '#e3f2fd' : 'white'
                    }}
                    onClick={() => handlePermissionChange(section.key)}
                  >
                    <div style={{ marginRight: '10px', color: '#666' }}>
                      {section.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                        {section.name}
                      </div>
                    </div>
                    <div style={{ color: newRole.permissions[section.key] ? '#28a745' : '#dee2e6' }}>
                      {newRole.permissions[section.key] ? <Eye size={16} /> : <EyeOff size={16} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { 
                  setShowAddModal(false); 
                  setNewRole({
                    name: '',
                    description: '',
                    permissions: {
                      dashboard: false,
                      users: false,
                      inquiries: false,
                      meetings: false,
                      projects: false,
                      pricing: false,
                      roles: false
                    }
                  })
                }}
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
                onClick={handleAddRole}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Rolu Redaktə Et</h2>
              <button
                onClick={() => { 
                  setShowEditModal(false); 
                  setSelectedRole(null);
                  setNewRole({
                    name: '',
                    description: '',
                    permissions: {
                      dashboard: false,
                      users: false,
                      inquiries: false,
                      meetings: false,
                      projects: false,
                      pricing: false,
                      roles: false
                    }
                  })
                }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                <X />
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Rol Adı *
              </label>
              <input
                type="text"
                name="name"
                value={newRole.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Rol adını daxil edin"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Təsvir
              </label>
              <textarea
                name="description"
                value={newRole.description}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Rol təsvirini daxil edin"
              ></textarea>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
                Səlahiyyətlər
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '10px' 
              }}>
                {sections.map(section => (
                  <div
                    key={section.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: newRole.permissions[section.key] ? '#e3f2fd' : 'white'
                    }}
                    onClick={() => handlePermissionChange(section.key)}
                  >
                    <div style={{ marginRight: '10px', color: '#666' }}>
                      {section.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                        {section.name}
                      </div>
                    </div>
                    <div style={{ color: newRole.permissions[section.key] ? '#28a745' : '#dee2e6' }}>
                      {newRole.permissions[section.key] ? <Eye size={16} /> : <EyeOff size={16} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { 
                  setShowEditModal(false); 
                  setSelectedRole(null);
                  setNewRole({
                    name: '',
                    description: '',
                    permissions: {
                      dashboard: false,
                      users: false,
                      inquiries: false,
                      meetings: false,
                      projects: false,
                      pricing: false,
                      roles: false
                    }
                  })
                }}
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
                onClick={handleUpdateRole}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Yenilə
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Rolu Sil</h2>
            <p style={{ marginBottom: '30px', color: '#555' }}>
              "{selectedRole?.name}" rolunu silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 15px',
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
                onClick={confirmDeleteRole}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#dc3545',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
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

export default RolesPage



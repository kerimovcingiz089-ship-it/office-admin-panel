import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Phone, Mail, MapPin, Building, Info } from 'lucide-react'

function InquiriesPage() {
  // localStorage-dan veriləri yüklə və ya standart veriləri istifadə et
  const getInitialInquiries = () => {
    const savedInquiries = localStorage.getItem('officeInquiries')
    if (savedInquiries) {
      return JSON.parse(savedInquiries)
    }
    // İlk dəfə açıldığında standart verilər
    return [
      {
        id: 1,
        firstName: 'Məhəmməd',
        lastName: 'Yılmaz',
        companyName: 'ABC Texnologiya MMC.',
        phone: '+994 50 123 45 67',
        address: 'Atatürk Küçəsi No:123, Bakı/Azərbaycan',
        email: 'mehmet.yilmaz@abctexnologiya.com',
        inquiryDate: '2024-01-15',
        status: 'active',
        notes: 'Yeni proqram layihəsi haqqında məlumat almaq istəyir.'
      },
      {
        id: 2,
        firstName: 'Aysə',
        lastName: 'Dəmir',
        companyName: 'XYZ Məsləhətçilik',
        phone: '+994 55 987 65 43',
        address: 'İstiqlaliyyət Küçəsi No:456, Bakı/Azərbaycan',
        email: 'ayse.demir@xyzməsləhətçilik.com',
        inquiryDate: '2024-01-14',
        status: 'active',
        notes: 'Veb sayt dizaynı mövzusunda qiymət təklifi istəyir.'
      },
      {
        id: 3,
        firstName: 'Əli',
        lastName: 'Kaya',
        companyName: 'Kaya Tikinti MMC.',
        phone: '+994 12 345 67 89',
        address: 'Bağdat Küçəsi No:789, Bakı/Azərbaycan',
        email: 'ali.kaya@kayatikinti.com',
        inquiryDate: '2024-01-13',
        status: 'completed',
        notes: 'Layihə tamamlandı, müştəri məmnun.'
      }
    ]
  }

  const [inquiries, setInquiries] = useState(getInitialInquiries)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [newInquiry, setNewInquiry] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
    status: 'active'
  })

  // Sorğular yeniləndiyində state-i yenilə
  useEffect(() => {
    const handleInquiriesUpdate = (event) => {
      console.log('Inquiries updated event received:', event.detail)
      setInquiries(event.detail.updatedInquiries)
    }

    window.addEventListener('inquiriesUpdated', handleInquiriesUpdate)
    
    return () => {
      window.removeEventListener('inquiriesUpdated', handleInquiriesUpdate)
    }
  }, [])

  const filteredInquiries = inquiries && inquiries.length > 0 ? inquiries.filter(inquiry =>
    inquiry && (
      (inquiry.firstName && inquiry.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.lastName && inquiry.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.companyName && inquiry.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.email && inquiry.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.phone && inquiry.phone.includes(searchTerm))
    )
  ) : []

  const handleAddInquiry = () => {
    if (newInquiry.firstName && newInquiry.lastName && newInquiry.phone) {
      const inquiryToAdd = {
        ...newInquiry,
        id: inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id)) + 1 : 1,
        inquiryDate: new Date().toISOString().split('T')[0]
      }
      const updatedInquiries = [...inquiries, inquiryToAdd]
      setInquiries(updatedInquiries)
      // localStorage-a yadda saxla
      localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
      setNewInquiry({
        firstName: '',
        lastName: '',
        companyName: '',
        phone: '',
        address: '',
        email: '',
        notes: '',
        status: 'active'
      })
      setShowAddModal(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewInquiry(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
    setNewInquiry({
      firstName: inquiry.firstName,
      lastName: inquiry.lastName,
      companyName: inquiry.companyName,
      phone: inquiry.phone,
      address: inquiry.address,
      email: inquiry.email,
      notes: inquiry.notes,
      status: inquiry.status
    })
    setShowEditModal(true)
  }

  const handleUpdateInquiry = () => {
    if (newInquiry.firstName && newInquiry.lastName && newInquiry.phone) {
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === selectedInquiry.id ? { ...inquiry, ...newInquiry } : inquiry
      )
      setInquiries(updatedInquiries)
      // localStorage-a yadda saxla
      localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
      setShowEditModal(false)
      setSelectedInquiry(null)
      setNewInquiry({
        firstName: '',
        lastName: '',
        companyName: '',
        phone: '',
        address: '',
        email: '',
        notes: '',
        status: 'active'
      })
    }
  }

  const handleDeleteInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowDeleteModal(true)
  }

  const confirmDeleteInquiry = () => {
    const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== selectedInquiry.id)
    setInquiries(updatedInquiries)
    // localStorage-a yadda saxla
    localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
    setShowDeleteModal(false)
    setSelectedInquiry(null)
  }

  return (
    <div>

      <div className="users-section">
        <div className="users-header">
          <h3>Müştəri Tələbləri</h3>
          <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Yeni Sorğu Əlavə Et
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
              placeholder="Müştəri axtar..."
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
              <th>Müştəri</th>
              <th>Şirkət</th>
              <th>Əlaqə</th>
              <th>Ünvan</th>
              <th>Tarix</th>
              <th>Vəziyyət</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="user-avatar">
                      {inquiry.firstName[0]}{inquiry.lastName[0]}
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {inquiry.firstName} {inquiry.lastName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {inquiry.id}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry)
                        setShowInfoModal(true)
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '6px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        marginLeft: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)'
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <Info size={12} />
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Building size={16} style={{ marginRight: '8px', color: '#666' }} />
                    <span>{inquiry.companyName || '-'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <Phone size={14} style={{ marginRight: '6px', color: '#666' }} />
                      <span>{inquiry.phone}</span>
                    </div>
                    {inquiry.email && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Mail size={14} style={{ marginRight: '6px', color: '#666' }} />
                        <span style={{ fontSize: '0.8rem' }}>{inquiry.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <MapPin size={14} style={{ marginRight: '6px', color: '#666', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inquiry.address || '-'}
                    </span>
                  </div>
                </td>
                <td>{new Date(inquiry.inquiryDate).toLocaleDateString('tr-TR')}</td>
                                 <td>
                   <span className={`user-status ${inquiry.status}`}>
                     {inquiry.status === 'active' ? 'Aktiv' : 
                      inquiry.status === 'planned' ? 'Planlandı' : 'Tamamlandı'}
                   </span>
                 </td>
                                 <td>
                   <div style={{ display: 'flex', gap: '8px' }}>
                     {inquiry.status === 'active' && (
                       <button 
                         onClick={() => handleEditInquiry(inquiry)}
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
                     )}
                     {inquiry.status === 'active' && (
                       <button 
                         onClick={() => handleDeleteInquiry(inquiry)}
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
                     )}
                     {inquiry.status !== 'active' && (
                       <span style={{ 
                         color: '#999', 
                         fontSize: '0.8rem',
                         fontStyle: 'italic'
                       }}>
                         {inquiry.status === 'planned' ? 'Planlaşdırıldı' : 'Tamamlandı'}
                       </span>
                     )}
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInquiries.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Axtarış kriterlərinə uyğun müştəri tələbi tapılmadı.
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
              {inquiries.length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi  Sorğu</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {inquiries.filter(i => i.status === 'active').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Aktiv Talepler</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {inquiries.filter(i => i.status === 'completed').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Tamamlanan</div>
          </div>
        </div>
      </div>

      {/* Add Inquiry Modal */}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni Müştəri Tələbi</h2>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Ad *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newInquiry.firstName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Ad daxil edin"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Soyad *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newInquiry.lastName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Soyad daxil edin"
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Şirkət Adı
              </label>
              <input
                type="text"
                name="companyName"
                value={newInquiry.companyName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Şirkət adını daxil edin"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newInquiry.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Telefon nömrəsi"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  E-poçt
                </label>
                <input
                  type="email"
                  name="email"
                  value={newInquiry.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="E-poçt ünvanı"
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Yaşayış Ünvanı
              </label>
              <textarea
                name="address"
                value={newInquiry.address}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder="Tam ünvanı daxil edin"
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qeydlər
              </label>
              <textarea
                name="notes"
                value={newInquiry.notes}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder="Müştəri tələbi haqqında qeydlər"
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Vəziyyət
              </label>
              <select
                name="status"
                value={newInquiry.status}
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
                <option value="active">Aktiv</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
                onClick={handleAddInquiry}
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
                Tələbi Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Inquiry Modal */}
      {showEditModal && selectedInquiry && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Müştəri Tələbini Düzənlə</h2>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Ad *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newInquiry.firstName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Ad daxil edin"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Soyad *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newInquiry.lastName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Soyad daxil edin"
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Şirkət Adı
              </label>
              <input
                type="text"
                name="companyName"
                value={newInquiry.companyName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Şirkət adını daxil edin"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newInquiry.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Telefon nömrəsi"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  E-poçt
                </label>
                <input
                  type="email"
                  name="email"
                  value={newInquiry.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="E-poçt ünvanı"
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Yaşayış Ünvanı
              </label>
              <textarea
                name="address"
                value={newInquiry.address}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder="Tam ünvanı daxil edin"
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qeydlər
              </label>
              <textarea
                name="notes"
                value={newInquiry.notes}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder="Müştəri tələbi haqqında qeydlər"
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Vəziyyət
              </label>
              <select
                name="status"
                value={newInquiry.status}
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
                <option value="active">Aktiv</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
                onClick={handleUpdateInquiry}
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

      {/* Info Modal */}
      {showInfoModal && selectedInquiry && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Müştəri Məlumatları</h2>
              <button 
                onClick={() => setShowInfoModal(false)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Sol tərəf */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Şəxsi Məlumatlar</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Ad:</strong> {selectedInquiry.firstName}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Soyad:</strong> {selectedInquiry.lastName}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>ID:</strong> {selectedInquiry.id}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: selectedInquiry.status === 'active' ? '#d4edda' : 
                                   selectedInquiry.status === 'planned' ? '#fff3cd' : '#f8d7da',
                        color: selectedInquiry.status === 'active' ? '#155724' : 
                               selectedInquiry.status === 'planned' ? '#856404' : '#721c24'
                      }}>
                        {selectedInquiry.status === 'active' ? 'Aktiv' : 
                         selectedInquiry.status === 'planned' ? 'Planlandı' : 'Tamamlandı'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Şirkət Məlumatları</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Şirkət Adı:</strong> {selectedInquiry.companyName || 'Məlumat yoxdur'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Ünvan:</strong> {selectedInquiry.address || 'Məlumat yoxdur'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ tərəf */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Əlaqə Məlumatları</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Telefon:</strong> {selectedInquiry.phone}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>E-poçt:</strong> {selectedInquiry.email || 'Məlumat yoxdur'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Digər Məlumatlar</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Sorğu Tarixi:</strong> {new Date(selectedInquiry.inquiryDate).toLocaleDateString('tr-TR')}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Qeydlər:</strong> {selectedInquiry.notes || 'Qeyd yoxdur'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInquiry && (
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
              <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>Tələbi Sil</h2>
              <p style={{ color: '#666', margin: 0 }}>
                <strong>{selectedInquiry.firstName} {selectedInquiry.lastName}</strong> müştəri tələbini silmək istədiyinizdən əmin misiniz?
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                Bu əməliyyat geri alına bilməz.
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
                onClick={confirmDeleteInquiry}
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
                Tələbi Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InquiriesPage

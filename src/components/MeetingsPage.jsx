import React, { useState, useCallback } from 'react'
import { Plus, Edit, Trash2, Search, X, Phone, Mail, MapPin, Building, Camera, Calendar, CheckCircle, Clock, Navigation, Info } from 'lucide-react'

function MeetingsPage() {
  // localStorage'dan görüşme verilerini yükle
  const getInitialMeetings = () => {
    const savedMeetings = localStorage.getItem('officeMeetings')
    if (savedMeetings) {
      return JSON.parse(savedMeetings)
    }
    return []
  }

  // localStorage'dan sorğu verilerini al
  const getInquiries = () => {
    const savedInquiries = localStorage.getItem('officeInquiries')
    if (savedInquiries) {
      return JSON.parse(savedInquiries)
    }
    return []
  }

  const [meetings, setMeetings] = useState(getInitialMeetings)
  const [inquiries, setInquiries] = useState(getInquiries)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    inquiryId: '',
    visitorName: '',
    visitDate: '',
    visitLocation: '',
    visitImages: [],
    visitNotes: '',
    shelfType: '', // Rəflərin növü
    status: 'pending' // pending, completed
  })



  // Yalnız aktiv sorğuları filtrlə (planlaşdırılmamış olanlar)
  const activeInquiries = inquiries.filter(inquiry => inquiry.status === 'active')

  // Görüşmələri filtrlə
  const filteredMeetings = meetings.filter(meeting => {
    const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
    if (!inquiry) return false
    
    return (
      inquiry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.visitorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Görüşmə əlavə etmə
  const handleAddMeeting = () => {
    if (newMeeting.inquiryId && newMeeting.visitorName && newMeeting.visitDate) {
      // Şəkil yükləmə prosesi davam edirsə gözlə
      if (isImageUploading) {
        console.log('Waiting for images to finish uploading...')
        setTimeout(() => handleAddMeeting(), 100)
        return
      }
      
      const meetingToAdd = {
        ...newMeeting,
        id: Math.max(...meetings.map(m => m.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      try {
        const updatedMeetings = [...meetings, meetingToAdd]
        setMeetings(updatedMeetings)
        localStorage.setItem('officeMeetings', JSON.stringify(updatedMeetings))
        console.log('Meeting added with images successfully')
        
        // Sorğu statusunu "planlaşdırıldı" olaraq yenilə
        const updatedInquiries = inquiries.map(inquiry => 
          inquiry.id === parseInt(newMeeting.inquiryId) 
            ? { ...inquiry, status: 'planned' } 
            : inquiry
        )
        setInquiries(updatedInquiries)
        localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
        
        setNewMeeting({
          inquiryId: '',
          visitorName: '',
          visitDate: '',
          visitLocation: '',
          visitImages: [],
          visitNotes: '',
          shelfType: '',
          status: 'pending'
        })
        setShowAddModal(false)
      } catch (storageError) {
        console.error('localStorage error:', storageError)
        alert('Görüşmə əlavə edilərkən xəta baş verdi.')
      }
    }
  }

    // Görüşmə yeniləmə
  const handleUpdateMeeting = () => {
    console.log('handleUpdateMeeting called', { newMeeting, selectedMeeting, isImageUploading })
    
    // Şəkil yükləmə prosesi davam edirsə gözlə
    if (isImageUploading) {
      console.log('Waiting for images to finish uploading...')
      setTimeout(() => handleUpdateMeeting(), 100)
      return
    }
    
    if (newMeeting.inquiryId && newMeeting.visitorName && newMeeting.visitDate) {
      try {
        // Şəkillərin yüklənməsini gözlə
        const totalImages = newMeeting.visitImages ? newMeeting.visitImages.length : 0
        console.log('Total images to process:', totalImages)
        
        // Görüşmələri yenilə (şəkillərlə birlikdə)
        const updatedMeetings = meetings.map(meeting => 
          meeting.id === selectedMeeting.id ? { ...meeting, ...newMeeting } : meeting
        )
        
        // localStorage-a yazmağa çalış
        try {
          setMeetings(updatedMeetings)
          localStorage.setItem('officeMeetings', JSON.stringify(updatedMeetings))
          console.log('Meetings saved to localStorage successfully')
        } catch (storageError) {
          console.error('localStorage error:', storageError)
          
          // Şəkillərsiz yenidən cəhd et
          const meetingWithoutImages = {
            ...newMeeting,
            visitImages: []
          }
          
          const updatedMeetingsWithoutImages = meetings.map(meeting => 
            meeting.id === selectedMeeting.id ? { ...meeting, ...meetingWithoutImages } : meeting
          )
          
          try {
            setMeetings(updatedMeetingsWithoutImages)
            localStorage.setItem('officeMeetings', JSON.stringify(updatedMeetingsWithoutImages))
            console.log('Meetings saved without images')
            alert('Şəkillər yaddaşa yazıla bilmədi, amma görüşmə məlumatları saxlanıldı.')
          } catch (secondError) {
            console.error('Second localStorage error:', secondError)
            alert('Yaddaş dolub. Köhnə məlumatları təmizləyin və yenidən cəhd edin.')
            return
          }
        }
        
        // Əgər status "completed" olaraq dəyişdirildisə, sorğu statusunu da yenilə
        if (newMeeting.status === 'completed' && selectedMeeting.status !== 'completed') {
          console.log('Updating inquiry status to design for inquiry ID:', newMeeting.inquiryId)
          
          const updatedInquiries = inquiries.map(inquiry => {
            if (inquiry.id === parseInt(newMeeting.inquiryId)) {
              console.log('Found inquiry to update:', inquiry)
              return { ...inquiry, status: 'design' }
            }
            return inquiry
          })
          
          console.log('Updated inquiries:', updatedInquiries)
          setInquiries(updatedInquiries)
          
          try {
            localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
            console.log('Inquiry status saved to localStorage')
          } catch (storageError) {
            console.error('localStorage error for inquiries:', storageError)
            alert('Sorğu məlumatları yaddaşa yazıla bilmədi.')
            return
          }
          
          // Debug: localStorage'ı kontrol et
          const savedInquiries = localStorage.getItem('officeInquiries')
          console.log('Saved inquiries in localStorage:', JSON.parse(savedInquiries))
          
          // Sorğular səhifəsinin yenilənməsi üçün custom event göndər
          window.dispatchEvent(new CustomEvent('inquiriesUpdated', {
            detail: { updatedInquiries }
          }))
        }
        
        // Modal'ı kapat - şəkilləri nəzərə alaraq
        console.log('Closing modal after image processing...')
        
        // Önce modal'ı kapat
        setShowEditModal(false)
        
        // Şəkillərin yüklənməsini gözlə və sonra state'leri təmizlə
        setTimeout(() => {
          const modalOverlay = document.querySelector('.modal-overlay')
          if (modalOverlay) {
            modalOverlay.remove()
          }
          
          setSelectedMeeting(null)
          setNewMeeting({
            inquiryId: '',
            visitorName: '',
            visitDate: '',
            visitLocation: '',
            visitImages: [],
            visitNotes: '',
            status: 'pending'
          })
          setIsImageUploading(false)
          console.log('Modal closed and state cleared after image processing')
        }, 300) // Şəkillər üçün daha çox vaxt
        
        console.log('Modal close process initiated')
      } catch (error) {
        console.error('Error updating meeting:', error)
        alert('Görüşmə yenilənərkən xəta baş verdi.')
      }
    } else {
      console.log('Validation failed', { newMeeting })
              alert('Zəhmət olmasa bütün lazımi sahələri doldurun.')
    }
  }

  // Görüşmə silmə
  const handleDeleteMeeting = (meeting) => {
    setSelectedMeeting(meeting)
    setShowDeleteModal(true)
  }

  const confirmDeleteMeeting = () => {
    const updatedMeetings = meetings.filter(meeting => meeting.id !== selectedMeeting.id)
    setMeetings(updatedMeetings)
    localStorage.setItem('officeMeetings', JSON.stringify(updatedMeetings))
    setShowDeleteModal(false)
    setSelectedMeeting(null)
  }

  // Görüşmə düzənləmə
  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting)
         setNewMeeting({
       inquiryId: meeting.inquiryId,
       visitorName: meeting.visitorName,
       visitDate: meeting.visitDate,
       visitLocation: meeting.visitLocation || '',
       visitImages: meeting.visitImages || [],
       visitNotes: meeting.visitNotes || '',
       shelfType: meeting.shelfType || '',
       status: meeting.status
     })
    setShowEditModal(true)
  }

  // Modal kapatma fonksiyonu
  const closeEditModal = useCallback(() => {
    setShowEditModal(false)
    setSelectedMeeting(null)
    setNewMeeting({
      inquiryId: '',
      visitorName: '',
      visitDate: '',
      visitLocation: '',
      visitImages: [],
      visitNotes: '',
      shelfType: '',
      status: 'pending'
    })
  }, [])

  // Input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMeeting(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Resim yükleme
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    console.log('Images being uploaded:', files.length, 'files')
    
    setIsImageUploading(true)
    
    // Şəkilləri sıxışdır və Promise ilə yüklə
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        // Şəkli sıxışdır
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          // Şəkli kiçild
          const maxWidth = 800
          const maxHeight = 600
          let { width, height } = img
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Şəkli çək və sıxışdır
          ctx.drawImage(img, 0, 0, width, height)
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7) // 70% keyfiyyət
          
          console.log('Image compressed successfully:', file.name)
          resolve(compressedImage)
        }
        
        img.onerror = () => {
          console.error('Error loading image:', file.name)
          reject(new Error(`Failed to load image: ${file.name}`))
        }
        
        const reader = new FileReader()
        reader.onloadend = () => {
          img.src = reader.result
        }
        reader.onerror = () => {
          console.error('Error reading image:', file.name)
          reject(new Error(`Failed to read image: ${file.name}`))
        }
        reader.readAsDataURL(file)
      })
    })
    
            // Bütün şəkilləri yüklə və sonra state'i yenilə
    Promise.all(imagePromises)
      .then(images => {
        // Şəkillərin ölçüsünü yoxla
        const totalSize = images.reduce((size, img) => {
          return size + (img.length * 0.75) // Base64 təxmini ölçü
        }, 0)
        
        console.log('Total images size (KB):', Math.round(totalSize / 1024))
        
        if (totalSize > 5 * 1024 * 1024) { // 5MB limit
          alert('Şəkillər çox böyükdür. Daha kiçik şəkillər seçin.')
          setIsImageUploading(false)
          return
        }
        
        setNewMeeting(prev => ({
          ...prev,
          visitImages: [...prev.visitImages, ...images]
        }))
        console.log('All images loaded and state updated')
        setIsImageUploading(false)
      })
      .catch(error => {
        console.error('Error loading images:', error)
        alert('Şəkillər yüklənərkən xəta baş verdi.')
        setIsImageUploading(false)
      })
  }

          // Şəkil silmə
  const handleRemoveImage = (index) => {
    setNewMeeting(prev => ({
      ...prev,
      visitImages: prev.visitImages.filter((_, i) => i !== index)
    }))
  }

  // localStorage təmizləmə
  const clearLocalStorage = () => {
    try {
      localStorage.clear()
      alert('Bütün məlumatlar təmizləndi. Səhifə yenilənəcək.')
      window.location.reload()
    } catch (error) {
      console.error('localStorage təmizləmə xətası:', error)
      alert('localStorage təmizlənə bilmədi.')
    }
  }

  // Konum alma
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setNewMeeting(prev => ({
        ...prev,
        visitLocation: 'Konum alınıyor...'
      }))
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          
          setNewMeeting(prev => ({
            ...prev,
            visitLocation: locationText
          }))
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          setNewMeeting(prev => ({
            ...prev,
            visitLocation: 'Konum alınamadı'
          }))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
              alert('Brauzeriniz məkan xüsusiyyətini dəstəkləmir.')
    }
  }

  // Sorğu seçimi
  const handleInquirySelect = (inquiry) => {
    setSelectedInquiry(inquiry)
    setNewMeeting(prev => ({
      ...prev,
      inquiryId: inquiry.id
    }))
  }

  return (
    <div>

      <div className="users-section">
        <div className="users-header">
          <h3>Ziyaret Planları</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Yeni Görüşmə Əlavə Et
            </button>
            <button 
              onClick={clearLocalStorage}
              style={{
                padding: '8px 16px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Yaddaşı Təmizlə
            </button>
          </div>
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
              placeholder="Görüşme ara..."
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
               <th>Ziyarətçi</th>
               <th>Ziyarət tarixi</th>
               <th>Konum</th>
               <th>Fotoğraflar</th>
                               <th>Status</th>
               <th>Əməliyyatlar</th>
             </tr>
           </thead>
          <tbody>
            {filteredMeetings.map(meeting => {
              const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
              if (!inquiry) return null

              return (
                <tr key={meeting.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="user-avatar">
                        {inquiry.firstName[0]}{inquiry.lastName[0]}
                      </div>
                      <div style={{ marginLeft: '12px' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          {inquiry.firstName} {inquiry.lastName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {inquiry.companyName || '-'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting)
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
                      <Calendar size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span>{meeting.visitorName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Clock size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span>{new Date(meeting.visitDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </td>
                                     <td>
                     <div style={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                       <MapPin size={14} style={{ marginRight: '6px', color: '#666', flexShrink: 0 }} />
                       <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {meeting.visitLocation || '-'}
                       </span>
                     </div>
                   </td>
                   <td>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                       <Camera size={14} style={{ marginRight: '6px', color: '#666' }} />
                       <span style={{ fontSize: '0.8rem' }}>
                         {(meeting.visitImages && meeting.visitImages.length) || 0} fotoğraf
                       </span>
                     </div>
                   </td>
                  <td>
                    <span className={`user-status ${meeting.status}`}>
                      {meeting.status === 'pending' ? 'Gözləyir' : 'Tamamlandı'}
                    </span>
                  </td>
                                     <td>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       {meeting.status === 'pending' && (
                         <button 
                           onClick={() => handleEditMeeting(meeting)}
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
                       {meeting.status === 'pending' && (
                         <button 
                           onClick={() => handleDeleteMeeting(meeting)}
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
                       {meeting.status === 'completed' && (
                         <span style={{ 
                           color: '#999', 
                           fontSize: '0.8rem',
                           fontStyle: 'italic'
                         }}>
                           Tamamlandı
                         </span>
                       )}
                     </div>
                   </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredMeetings.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Axtarış kriterlərinə uyğun görüşmə tapılmadı.
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
              {meetings.length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi  Görüşme</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {meetings.filter(m => m.status === 'pending').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Gözləyən Ziyarətlər</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {meetings.filter(m => m.status === 'completed').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Tamamlanan</div>
          </div>
        </div>
      </div>

      {/* Add Meeting Modal */}
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
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni Görüşmə Planı</h2>
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

            {/* Müştəri Seçimi */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
                Müştəri Seçimi *
              </label>
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                padding: '10px'
              }}>
                {activeInquiries.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    Aktiv müştəri tələbi tapılmadı. Əvvəlcə "Sorğular" bölməsindən müştəri əlavə edin.
                  </div>
                ) : (
                  activeInquiries.map(inquiry => (
                    <div
                      key={inquiry.id}
                      onClick={() => handleInquirySelect(inquiry)}
                      style={{
                        padding: '10px',
                        border: newMeeting.inquiryId === inquiry.id ? '2px solid #667eea' : '1px solid #eee',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        background: newMeeting.inquiryId === inquiry.id ? '#f8f9ff' : 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        {inquiry.firstName} {inquiry.lastName}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {inquiry.companyName || 'Şirket bilgisi yok'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        {inquiry.phone}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Ziyarətçi Adı *
                </label>
                <input
                  type="text"
                  name="visitorName"
                  value={newMeeting.visitorName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Ziyarətçi adı giriniz"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Ziyarət tarixi *
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={newMeeting.visitDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

                         <div style={{ marginTop: '15px' }}>
               <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                 Ziyaret Konumu
               </label>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <input
                   type="text"
                   name="visitLocation"
                   value={newMeeting.visitLocation}
                   onChange={handleInputChange}
                   style={{
                     flex: 1,
                     padding: '12px',
                     border: '1px solid #ddd',
                     borderRadius: '8px',
                     fontSize: '14px',
                     outline: 'none'
                   }}
                   placeholder="Ziyaret edilecek konum"
                 />
                 <button
                   type="button"
                   onClick={getCurrentLocation}
                   style={{
                     padding: '12px 16px',
                     background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     fontSize: '14px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px',
                     whiteSpace: 'nowrap'
                   }}
                 >
                   <Navigation size={16} />
                   Konum Al
                 </button>
               </div>
             </div>

             {/* Resim Yükleme */}
             <div style={{ marginTop: '15px' }}>
               <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                 Ziyaret Fotoğrafları
               </label>
               <input
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={handleImageUpload}
                 style={{
                   width: '100%',
                   padding: '12px',
                   border: '1px solid #ddd',
                   borderRadius: '8px',
                   fontSize: '14px',
                   outline: 'none'
                 }}
               />
               {newMeeting.visitImages.length > 0 && (
                 <div style={{ marginTop: '15px' }}>
                   <h4 style={{ marginBottom: '10px', color: '#333', fontSize: '0.9rem' }}>
                     Yüklenen Fotoğraflar ({newMeeting.visitImages.length})
                   </h4>
                   <div style={{ 
                     display: 'grid', 
                     gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                     gap: '10px' 
                   }}>
                     {newMeeting.visitImages.map((image, index) => (
                       <div key={index} style={{ position: 'relative' }}>
                         <img 
                           src={image} 
                           alt={`Ziyaret fotoğrafı ${index + 1}`} 
                           style={{ 
                             width: '100%', 
                             height: '120px', 
                             objectFit: 'cover',
                             borderRadius: '8px',
                             border: '1px solid #ddd'
                           }} 
                         />
                         <button
                           onClick={() => handleRemoveImage(index)}
                           style={{
                             position: 'absolute',
                             top: '5px',
                             right: '5px',
                             background: '#dc3545',
                             color: 'white',
                             border: 'none',
                             borderRadius: '50%',
                             width: '24px',
                             height: '24px',
                             cursor: 'pointer',
                             fontSize: '12px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center'
                           }}
                         >
                           ×
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             <div style={{ marginTop: '15px' }}>
               <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                 Ziyaret Notları
               </label>
              <textarea
                name="visitNotes"
                value={newMeeting.visitNotes}
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
                placeholder="Ziyaret hakkında notlar"
              />
            </div>

            {/* Rəflərin növü */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Rəflərin növü
              </label>
              <select
                name="shelfType"
                value={newMeeting.shelfType}
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
                <option value="">Rəf növü seçin</option>
                <option value="Mini Rəf">Mini Rəf</option>
                <option value="Pallet Rəf">Pallet Rəf</option>
                <option value="Civatalı rəf">Civatalı rəf</option>
                <option value="Drive-İn rəf">Drive-İn rəf</option>
                <option value="Konsol Qollu Rəf">Konsol Qollu Rəf</option>
                <option value="Mezonin Rəf">Mezonin Rəf</option>
                <option value="Market rəfi">Market rəfi</option>
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
                İptal
              </button>
              <button
                onClick={handleAddMeeting}
                disabled={isImageUploading}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isImageUploading 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: isImageUploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isImageUploading ? 'Şəkillər yüklənir...' : 'Görüşmə Əlavə Et'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && selectedMeeting && (
        <div 
          className="modal-overlay" 
          onClick={closeEditModal}
          style={{
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
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Görüşmə Düzənlə</h2>
              <button 
                onClick={closeEditModal}
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

            {/* Müştəri Bilgisi */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Müştəri Bilgisi</h4>
              {(() => {
                const inquiry = inquiries.find(i => i.id === newMeeting.inquiryId)
                return inquiry ? (
                  <div>
                    <div style={{ fontWeight: '600' }}>{inquiry.firstName} {inquiry.lastName}</div>
                    <div style={{ color: '#666' }}>{inquiry.companyName || 'Şirket bilgisi yok'}</div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>{inquiry.phone}</div>
                  </div>
                ) : <div style={{ color: '#666' }}>Müştəri bulunamadı</div>
              })()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Ziyarətçi Adı *
                </label>
                <input
                  type="text"
                  name="visitorName"
                  value={newMeeting.visitorName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Ziyarətçi adı giriniz"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Ziyarət tarixi *
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={newMeeting.visitDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

                         <div style={{ marginTop: '15px' }}>
               <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                 Ziyaret Konumu
               </label>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <input
                   type="text"
                   name="visitLocation"
                   value={newMeeting.visitLocation}
                   onChange={handleInputChange}
                   style={{
                     flex: 1,
                     padding: '12px',
                     border: '1px solid #ddd',
                     borderRadius: '8px',
                     fontSize: '14px',
                     outline: 'none'
                   }}
                   placeholder="Ziyaret edilecek konum"
                 />
                 <button
                   type="button"
                   onClick={getCurrentLocation}
                   style={{
                     padding: '12px 16px',
                     background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     fontSize: '14px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px',
                     whiteSpace: 'nowrap'
                   }}
                 >
                   <Navigation size={16} />
                   Konum Al
                 </button>
               </div>
             </div>

                         {/* Resim Yükleme */}
             <div style={{ marginTop: '15px' }}>
               <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                 Ziyaret Fotoğrafları
               </label>
               <input
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={handleImageUpload}
                 style={{
                   width: '100%',
                   padding: '12px',
                   border: '1px solid #ddd',
                   borderRadius: '8px',
                   fontSize: '14px',
                   outline: 'none'
                 }}
               />
               {newMeeting.visitImages.length > 0 && (
                 <div style={{ marginTop: '15px' }}>
                   <h4 style={{ marginBottom: '10px', color: '#333', fontSize: '0.9rem' }}>
                     Yüklenen Fotoğraflar ({newMeeting.visitImages.length})
                   </h4>
                   <div style={{ 
                     display: 'grid', 
                     gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                     gap: '10px' 
                   }}>
                     {newMeeting.visitImages.map((image, index) => (
                       <div key={index} style={{ position: 'relative' }}>
                         <img 
                           src={image} 
                           alt={`Ziyaret fotoğrafı ${index + 1}`} 
                           style={{ 
                             width: '100%', 
                             height: '120px', 
                             objectFit: 'cover',
                             borderRadius: '8px',
                             border: '1px solid #ddd'
                           }} 
                         />
                         <button
                           onClick={() => handleRemoveImage(index)}
                           style={{
                             position: 'absolute',
                             top: '5px',
                             right: '5px',
                             background: '#dc3545',
                             color: 'white',
                             border: 'none',
                             borderRadius: '50%',
                             width: '24px',
                             height: '24px',
                             cursor: 'pointer',
                             fontSize: '12px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center'
                           }}
                         >
                           ×
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Ziyaret Notları
              </label>
              <textarea
                name="visitNotes"
                value={newMeeting.visitNotes}
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
                placeholder="Ziyaret hakkında notlar"
              />
            </div>

            {/* Rəflərin növü */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Rəflərin növü
              </label>
              <select
                name="shelfType"
                value={newMeeting.shelfType}
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
                <option value="">Rəf növü seçin</option>
                <option value="Mini Rəf">Mini Rəf</option>
                <option value="Pallet Rəf">Pallet Rəf</option>
                <option value="Civatalı rəf">Civatalı rəf</option>
                <option value="Drive-İn rəf">Drive-İn rəf</option>
                <option value="Konsol Qollu Rəf">Konsol Qollu Rəf</option>
                <option value="Market rəfi">Market rəfi</option>
              </select>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Durum
              </label>
              <select
                name="status"
                value={newMeeting.status}
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
                <option value="pending">Bekliyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={closeEditModal}
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
                İptal
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Update button clicked')
                  handleUpdateMeeting()
                }}
                disabled={isImageUploading}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isImageUploading 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: 'white',
                  cursor: isImageUploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isImageUploading ? 'Şəkillər yüklənir...' : 'Yenilə'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && selectedMeeting && (() => {
        const inquiry = inquiries.find(i => i.id === selectedMeeting.inquiryId)
        return (
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#333', margin: 0 }}>Görüşmə Məlumatları</h2>
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
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Müştəri Məlumatları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ad:</strong> {inquiry?.firstName || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Soyad:</strong> {inquiry?.lastName || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Şirkət:</strong> {inquiry?.companyName || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Telefon:</strong> {inquiry?.phone || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>E-poçt:</strong> {inquiry?.email || 'Məlumat yoxdur'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Görüşmə Detalları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ziyarətçi:</strong> {selectedMeeting.visitorName}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ziyarət Tarixi:</strong> {new Date(selectedMeeting.visitDate).toLocaleDateString('tr-TR')}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          marginLeft: '8px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: selectedMeeting.status === 'pending' ? '#fff3cd' : '#d4edda',
                          color: selectedMeeting.status === 'pending' ? '#856404' : '#155724'
                        }}>
                          {selectedMeeting.status === 'pending' ? 'Gözləyir' : 'Tamamlandı'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ tərəf */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Konum və Şəkillər</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Konum:</strong> {selectedMeeting.visitLocation || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Şəkil Sayı:</strong> {(selectedMeeting.visitImages && selectedMeeting.visitImages.length) || 0}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Qeydlər</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Görüşmə Qeydləri:</strong> {selectedMeeting.visitNotes || 'Qeyd yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Rəflərin növü:</strong> {selectedMeeting.shelfType || 'Məlumat yoxdur'}
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
        )
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMeeting && (
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
              <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>Görüşməni Sil</h2>
              <p style={{ color: '#666', margin: 0 }}>
                Bu görüşmə qeydini silmək istədiyinizdən əmin misiniz?
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                Bu işlem geri alınamaz.
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
                İptal
              </button>
              <button
                onClick={confirmDeleteMeeting}
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
                Görüşməni Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeetingsPage

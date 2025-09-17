import React, { useState } from 'react'
import { Plus, Edit, Trash2, Search, X, Phone, Mail, MapPin, Building, Camera, Calendar, CheckCircle, Clock, FileText, Download, Eye, Info } from 'lucide-react'

function ProjectsPage() {
  // localStorage'dan proje verilerini yükle
  const getInitialProjects = () => {
    const savedProjects = localStorage.getItem('officeProjects')
    if (savedProjects) {
      return JSON.parse(savedProjects)
    }
    return []
  }

  // localStorage-dan tamamlanan görüşmə məlumatlarını al
  const getCompletedMeetings = () => {
    const savedMeetings = localStorage.getItem('officeMeetings')
    if (savedMeetings) {
      const meetings = JSON.parse(savedMeetings)
      return meetings.filter(meeting => meeting.status === 'completed')
    }
    return []
  }

  // Henüz projesi oluşturulmamış görüşmeleri al
  const getAvailableMeetings = () => {
    const completedMeetings = getCompletedMeetings()
    const existingProjects = getInitialProjects()
    
    // Mevcut projelerde kullanılan meeting ID'lerini al
    const usedMeetingIds = existingProjects.map(project => project.meetingId)
    
    // Hələ layihəsi yaradılmamış görüşmələri filtrlə
    return completedMeetings.filter(meeting => !usedMeetingIds.includes(meeting.id))
  }

  // localStorage'dan sorğu verilerini al
  const getInquiries = () => {
    const savedInquiries = localStorage.getItem('officeInquiries')
    if (savedInquiries) {
      return JSON.parse(savedInquiries)
    }
    return []
  }

  const [projects, setProjects] = useState(getInitialProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageType, setImageType] = useState('project') // 'project' veya 'meeting'
  const [newProject, setNewProject] = useState({
    meetingId: '',
    projectImages: [],
    projectPdf: null,
    projectNotes: '',
    status: 'pending' // pending, completed
  })

  const completedMeetings = getCompletedMeetings()
  const availableMeetings = getAvailableMeetings()
  const inquiries = getInquiries()
  
  // Tüm meetings verilerini al (sadece completed değil)
  const getMeetings = () => {
    const savedMeetings = localStorage.getItem('officeMeetings')
    if (savedMeetings) {
      return JSON.parse(savedMeetings)
    }
    return []
  }
  const meetings = getMeetings()

  // Layihələri filtrlə
  const filteredProjects = projects.filter(project => {
    const meeting = completedMeetings.find(m => m.id === project.meetingId)
    if (!meeting) return false
    
    const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
    if (!inquiry) return false
    
    return (
      inquiry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.visitorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Layihə əlavə etmə
  const handleAddProject = () => {
    if (newProject.meetingId) {
      const projectToAdd = {
        ...newProject,
        id: Math.max(...projects.map(p => p.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      }
      const updatedProjects = [...projects, projectToAdd]
      setProjects(updatedProjects)
      localStorage.setItem('officeProjects', JSON.stringify(updatedProjects))
      
      setNewProject({
        meetingId: '',
        projectImages: [],
        projectPdf: null,
        projectNotes: '',
        status: 'pending'
      })
      setShowAddModal(false)
    }
  }

  // Layihə yeniləmə
  const handleUpdateProject = () => {
    console.log('handleUpdateProject çağrıldı')
    console.log('selectedProject:', selectedProject)
    console.log('newProject:', newProject)
    
    // Layihəni yenilə
    const updatedProjects = projects.map(project => 
      project.id === selectedProject.id ? { ...project, ...newProject } : project
    )
    console.log('updatedProjects:', updatedProjects)
    setProjects(updatedProjects)
    localStorage.setItem('officeProjects', JSON.stringify(updatedProjects))
    
    // Əgər layihə tamamlandısa, müvafiq inquiry-nin statusunu 'pricing' et
    if (newProject.status === 'completed' && selectedProject.status !== 'completed') {
      // Əvvəlcə meetings-dən inquiry ID-sini tap
      const meeting = meetings.find(m => m.id === parseInt(newProject.meetingId))
      if (meeting && meeting.inquiryId) {
        // Inquiry-ləri yenilə
        const savedInquiries = localStorage.getItem('officeInquiries')
        if (savedInquiries) {
          const inquiries = JSON.parse(savedInquiries)
          const updatedInquiries = inquiries.map(inquiry => {
            if (inquiry.id === parseInt(meeting.inquiryId)) {
              return { ...inquiry, status: 'pricing' }
            }
            return inquiry
          })
          localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
          
          // HomePage-in yenilənməsi üçün custom event göndər
          window.dispatchEvent(new CustomEvent('inquiriesUpdated', {
            detail: { updatedInquiries }
          }))
        }
      }
    }
    
    // Modal-ı bağla və state-ləri təmizlə
    console.log('Modal bağlanır...')
    closeEditModal()
    console.log('Modal bağlandı və state-lər təmizləndi')
  }

  // Layihə silmə
  const handleDeleteProject = (project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const confirmDeleteProject = () => {
    const updatedProjects = projects.filter(project => project.id !== selectedProject.id)
    setProjects(updatedProjects)
    localStorage.setItem('officeProjects', JSON.stringify(updatedProjects))
    setShowDeleteModal(false)
    setSelectedProject(null)
  }

  // Layihə düzənləmə
  const handleEditProject = (project) => {
    console.log('handleEditProject çağrıldı:', project)
    setSelectedProject(project)
    setNewProject({
      meetingId: project.meetingId,
      projectImages: project.projectImages || [],
      projectPdf: project.projectPdf || null,
      projectNotes: project.projectNotes || '',
      status: project.status
    })
    setShowEditModal(true)
  }

  // Modal bağlama funksiyası
  const closeEditModal = () => {
    console.log('closeEditModal çağrıldı')
    setShowEditModal(false)
    setSelectedProject(null)
    setNewProject({
      meetingId: '',
      projectImages: [],
      projectPdf: null,
      projectNotes: '',
      status: 'pending'
    })
  }

  // Görüşme seçimi
  const handleMeetingSelect = (meeting) => {
    setSelectedMeeting(meeting)
    setNewProject(prev => ({
      ...prev,
      meetingId: meeting.id
    }))
  }

  // Resim yükleme
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProject(prev => ({
          ...prev,
          projectImages: [...prev.projectImages, reader.result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

      // Şəkil silmə
    const handleRemoveImage = (index) => {
    setNewProject(prev => ({
      ...prev,
      projectImages: prev.projectImages.filter((_, i) => i !== index)
    }))
  }

  // PDF yükleme
  const handlePdfUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProject(prev => ({
          ...prev,
          projectPdf: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

      // PDF silmə
    const handleRemovePdf = () => {
    setNewProject(prev => ({
      ...prev,
      projectPdf: null
    }))
  }

  // Şəkil göstərmə modalını aç
  const handleViewImages = (project, type = 'project') => {
    setSelectedProject(project)
    setImageType(type)
    
    if (type === 'meeting') {
      // Görüşmə şəkillərini göstər
      const meeting = completedMeetings.find(m => m.id === project.meetingId)
      setSelectedImages(meeting?.visitImages || [])
    } else {
      // Layihə şəkillərini göstər
      setSelectedImages(project.projectImages || [])
    }
    
    setCurrentImageIndex(0)
    setShowImageModal(true)
  }

  // Növbəti şəkil
  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === selectedImages.length - 1 ? 0 : prev + 1
    )
  }

  // Əvvəlki şəkil
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? selectedImages.length - 1 : prev - 1
    )
  }

  // Şəkil əlavə etmə (modal daxilində)
  const handleAddImageInModal = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newImage = reader.result
        setSelectedImages(prev => [...prev, newImage])
        
        // Layihəni də yenilə
        const updatedProjects = projects.map(project => 
          project.id === selectedProject.id 
            ? { ...project, projectImages: [...(project.projectImages || []), newImage] }
            : project
        )
        setProjects(updatedProjects)
        localStorage.setItem('officeProjects', JSON.stringify(updatedProjects))
      }
      reader.readAsDataURL(file)
    })
  }

  // Şəkil silmə (modal daxilində)
  const handleRemoveImageInModal = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(updatedImages)
    
    // Layihəni də yenilə
    const updatedProjects = projects.map(project => 
      project.id === selectedProject.id 
        ? { ...project, projectImages: updatedImages }
        : project
    )
    setProjects(updatedProjects)
    localStorage.setItem('officeProjects', JSON.stringify(updatedProjects))
    
    // Əgər silinən şəkil mövcud şəkilse, index-i təyin et
    if (index === currentImageIndex) {
      setCurrentImageIndex(0)
    } else if (index < currentImageIndex) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }

  // PDF göstərmə modalını aç
  const handleViewPdf = (project) => {
    setSelectedProject(project)
    setShowPdfModal(true)
  }

  return (
    <div>

      <div className="users-section">
        <div className="users-header">
          <h3>Proje Dosyaları</h3>
          <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Yeni Layihə Əlavə Et
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
              placeholder="Proje ara..."
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
              <th>Layihə Şəkilləri</th>
              <th>Rəf Növü</th>
              <th>PDF Faylı</th>
              <th>Status</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => {
              const meeting = completedMeetings.find(m => m.id === project.meetingId)
              if (!meeting) return null
              
              const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
              if (!inquiry) return null

              return (
                <tr key={project.id}>
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
                          setSelectedProject(project)
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
                     <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '5px' }}>
                       {/* Layihə Şəkilləri */}
                       <div style={{ display: 'flex', alignItems: 'center' }}>
                         <Camera size={14} style={{ marginRight: '6px', color: '#666' }} />
                         <span style={{ fontSize: '0.8rem' }}>
                           {(project.projectImages && project.projectImages.length) || 0} layihə şəkli
                         </span>
                         {(project.projectImages && project.projectImages.length > 0) && (
                           <button
                             onClick={() => handleViewImages(project, 'project')}
                             style={{
                               background: '#007bff',
                               color: 'white',
                               border: 'none',
                               padding: '4px 8px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               marginLeft: '8px'
                             }}
                           >
                             Görüntüle
                           </button>
                         )}
                       </div>
                       
                       {/* Görüşme Resimleri */}
                       <div style={{ display: 'flex', alignItems: 'center' }}>
                         <Calendar size={14} style={{ marginRight: '6px', color: '#666' }} />
                         <span style={{ fontSize: '0.8rem' }}>
                           {(meeting.visitImages && meeting.visitImages.length) || 0} görüşmə şəkli
                         </span>
                         {(meeting.visitImages && meeting.visitImages.length > 0) && (
                           <button
                             onClick={() => handleViewImages(project, 'meeting')}
                             style={{
                               background: '#28a745',
                               color: 'white',
                               border: 'none',
                               padding: '4px 8px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               marginLeft: '8px'
                             }}
                           >
                             Görüntüle
                           </button>
                         )}
                       </div>
                     </div>
                   </td>
                  
                  {/* Rəf Növü */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Building size={14} style={{ marginRight: '6px', color: '#666' }} />
                      <span style={{ fontSize: '0.8rem', color: '#333' }}>
                        {meeting.shelfType || 'Məlumat yoxdur'}
                      </span>
                    </div>
                  </td>
                  
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileText size={14} style={{ marginRight: '6px', color: '#666' }} />
                      <span style={{ fontSize: '0.8rem' }}>
                        {project.projectPdf ? 'PDF yükləndi' : 'PDF yox'}
                      </span>
                      {project.projectPdf && (
                        <button
                          onClick={() => handleViewPdf(project)}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            marginLeft: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} />
                          Görüntüle
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`user-status ${project.status}`}>
                      {project.status === 'pending' ? 'Gözləyir' : 'Tamamlandı'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {project.status === 'pending' && (
                        <button 
                          onClick={() => handleEditProject(project)}
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
                      {project.status === 'pending' && (
                        <button 
                          onClick={() => handleDeleteProject(project)}
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
                      {project.status === 'completed' && (
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

        {filteredProjects.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Arama kriterlerine uygun proje bulunamadı.
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
              {projects.length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi Layihələr</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {projects.filter(p => p.status === 'pending').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Gözləyən Layihələr</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Tamamlanan</div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowAddModal(false)}
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
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni Proje Ekle</h2>
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

            {/* Tamamlanan Görüşme Seçimi */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
                Tamamlanan Görüşme Seçimi *
              </label>
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                padding: '10px'
              }}>
                                 {availableMeetings.length === 0 ? (
                   <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                     {completedMeetings.length === 0 ? 
                       'Tamamlanan görüşme bulunamadı. Önce "Görüşmeler" bölümünden görüşme tamamlayın.' :
                       'Tüm tamamlanan görüşmeler için proje oluşturulmuş. Yeni proje eklemek için önce yeni görüşme tamamlayın.'
                     }
                   </div>
                 ) : (
                   availableMeetings.map(meeting => {
                    const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
                    if (!inquiry) return null
                    
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => handleMeetingSelect(meeting)}
                        style={{
                          padding: '10px',
                          border: newProject.meetingId === meeting.id ? '2px solid #667eea' : '1px solid #eee',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          background: newProject.meetingId === meeting.id ? '#f8f9ff' : 'white',
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
                          Ziyarətçi: {meeting.visitorName} | Tarih: {new Date(meeting.visitDate).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Seçilen Görüşme Bilgileri */}
            {selectedMeeting && (() => {
              const inquiry = inquiries.find(i => i.id === selectedMeeting.inquiryId)
              return inquiry ? (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Müştəri ve Görüşme Bilgileri</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Müştəri: {inquiry.firstName} {inquiry.lastName}</div>
                      <div style={{ color: '#666' }}>Şirket: {inquiry.companyName || 'Bilgi yok'}</div>
                      <div style={{ color: '#666' }}>Telefon: {inquiry.phone}</div>
                      <div style={{ color: '#666' }}>E-posta: {inquiry.email}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Ziyarətçi: {selectedMeeting.visitorName}</div>
                      <div style={{ color: '#666' }}>Tarih: {new Date(selectedMeeting.visitDate).toLocaleDateString('tr-TR')}</div>
                      <div style={{ color: '#666' }}>Konum: {selectedMeeting.visitLocation || 'Bilgi yok'}</div>
                      <div style={{ color: '#666' }}>Fotoğraflar: {(selectedMeeting.visitImages && selectedMeeting.visitImages.length) || 0} adet</div>
                    </div>
                  </div>
                </div>
              ) : null
            })()}

            {/* Layihə Şəkilləri */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Layihə Şəkilləri
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={newProject.status === 'completed'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: newProject.status === 'completed' ? '#f5f5f5' : 'white',
                  cursor: newProject.status === 'completed' ? 'not-allowed' : 'pointer'
                }}
              />
              {newProject.projectImages.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#333', fontSize: '0.9rem' }}>
                    Yüklenen Resimler ({newProject.projectImages.length})
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '10px' 
                  }}>
                    {newProject.projectImages.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={image} 
                          alt={`layihə şəkli ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }} 
                        />
                        {newProject.status === 'pending' && (
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PDF Faylı */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                PDF Faylı
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {newProject.projectPdf && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#e9ecef', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileText size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span style={{ fontSize: '0.9rem' }}>PDF Faylı yüklendi</span>
                    </div>
                    <button
                      onClick={handleRemovePdf}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Proje Notları */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Proje Notları
              </label>
              <textarea
                value={newProject.projectNotes}
                onChange={(e) => setNewProject(prev => ({ ...prev, projectNotes: e.target.value }))}
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
                placeholder="Proje hakkında notlar"
              />
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
                onClick={handleAddProject}
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
                Proje Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
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
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Proje Düzenle</h2>
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

            {/* Görüşme Bilgisi */}
            {(() => {
              const meeting = completedMeetings.find(m => m.id === newProject.meetingId)
              const inquiry = meeting ? inquiries.find(i => i.id === meeting.inquiryId) : null
              return meeting && inquiry ? (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Müştəri ve Görüşme Bilgileri</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Müştəri: {inquiry.firstName} {inquiry.lastName}</div>
                      <div style={{ color: '#666' }}>Şirket: {inquiry.companyName || 'Bilgi yok'}</div>
                      <div style={{ color: '#666' }}>Telefon: {inquiry.phone}</div>
                      <div style={{ color: '#666' }}>E-posta: {inquiry.email}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Ziyarətçi: {meeting.visitorName}</div>
                      <div style={{ color: '#666' }}>Tarih: {new Date(meeting.visitDate).toLocaleDateString('tr-TR')}</div>
                      <div style={{ color: '#666' }}>Konum: {meeting.visitLocation || 'Bilgi yok'}</div>
                      <div style={{ color: '#666' }}>Fotoğraflar: {(meeting.visitImages && meeting.visitImages.length) || 0} adet</div>
                    </div>
                  </div>
                </div>
              ) : <div style={{ color: '#666' }}>Görüşme bilgisi bulunamadı</div>
            })()}

            {/* Layihə Şəkilləri */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Layihə Şəkilləri
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={newProject.status === 'completed'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: newProject.status === 'completed' ? '#f5f5f5' : 'white',
                  cursor: newProject.status === 'completed' ? 'not-allowed' : 'pointer'
                }}
              />
              {newProject.projectImages.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#333', fontSize: '0.9rem' }}>
                    Yüklenen Resimler ({newProject.projectImages.length})
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '10px' 
                  }}>
                    {newProject.projectImages.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={image} 
                          alt={`layihə şəkli ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }} 
                        />
                        {newProject.status === 'pending' && (
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PDF Faylı */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                PDF Faylı
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {newProject.projectPdf && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#e9ecef', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileText size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span style={{ fontSize: '0.9rem' }}>PDF Faylı yüklendi</span>
                    </div>
                    <button
                      onClick={handleRemovePdf}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Proje Notları */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Proje Notları
              </label>
              <textarea
                value={newProject.projectNotes}
                onChange={(e) => setNewProject(prev => ({ ...prev, projectNotes: e.target.value }))}
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
                placeholder="Proje hakkında notlar"
              />
            </div>

            {/* Durum */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Durum
              </label>
              <select
                value={newProject.status}
                onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value }))}
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
                onClick={handleUpdateProject}
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
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowDeleteModal(false)}
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
              maxWidth: '400px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              textAlign: 'center'
            }}
          >
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
              <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>Projeyi Sil</h2>
              <p style={{ color: '#666', margin: 0 }}>
                Bu proje kaydını silmek istediğinizden emin misiniz?
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
                onClick={confirmDeleteProject}
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
                Projeyi Sil
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* Image Viewer Modal */}
       {showImageModal && selectedProject && (
         <div 
           className="modal-overlay" 
           onClick={() => setShowImageModal(false)}
           style={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'rgba(0, 0, 0, 0.9)',
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
               background: 'transparent',
               padding: '20px',
               borderRadius: '15px',
               width: '95%',
               maxWidth: '1200px',
               maxHeight: '95vh',
               position: 'relative'
             }}
           >
             {/* Header */}
             <div style={{ 
               display: 'flex', 
               justifyContent: 'space-between', 
               alignItems: 'center', 
               marginBottom: '20px',
               color: 'white'
             }}>
                               <h2 style={{ margin: 0, color: 'white' }}>
                  {imageType === 'meeting' ? 'Görüşme Resimleri' : 'Layihə Şəkilləri'} ({selectedImages.length})
                </h2>
               <button 
                 onClick={() => setShowImageModal(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '2rem',
                   cursor: 'pointer',
                   color: 'white'
                 }}
               >
                 <X />
               </button>
             </div>

             {/* Main Image Viewer */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               marginBottom: '20px',
               position: 'relative'
             }}>
               {/* Previous Button */}
               {selectedImages.length > 1 && (
                 <button
                   onClick={handlePrevImage}
                   style={{
                     position: 'absolute',
                     left: '20px',
                     top: '50%',
                     transform: 'translateY(-50%)',
                     background: 'rgba(0, 0, 0, 0.7)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '50%',
                     width: '50px',
                     height: '50px',
                     cursor: 'pointer',
                     fontSize: '1.5rem',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     zIndex: 10
                   }}
                 >
                   ‹
                 </button>
               )}

               {/* Current Image */}
               {selectedImages.length > 0 ? (
                 <img 
                   src={selectedImages[currentImageIndex]} 
                   alt={`layihə şəkli ${currentImageIndex + 1}`} 
                   style={{ 
                     maxWidth: '100%', 
                     maxHeight: '70vh', 
                     objectFit: 'contain',
                     borderRadius: '8px',
                     boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                   }} 
                 />
               ) : (
                 <div style={{ 
                   color: 'white', 
                   fontSize: '1.2rem',
                   textAlign: 'center',
                   padding: '40px'
                 }}>
                   Henüz resim yüklenmemiş
                 </div>
               )}

               {/* Next Button */}
               {selectedImages.length > 1 && (
                 <button
                   onClick={handleNextImage}
                   style={{
                     position: 'absolute',
                     right: '20px',
                     top: '50%',
                     transform: 'translateY(-50%)',
                     background: 'rgba(0, 0, 0, 0.7)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '50%',
                     width: '50px',
                     height: '50px',
                     cursor: 'pointer',
                     fontSize: '1.5rem',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     zIndex: 10
                   }}
                 >
                   ›
                 </button>
               )}
             </div>

             {/* Image Counter */}
             {selectedImages.length > 0 && (
               <div style={{ 
                 textAlign: 'center', 
                 color: 'white', 
                 marginBottom: '20px',
                 fontSize: '1.1rem'
               }}>
                 {currentImageIndex + 1} / {selectedImages.length}
               </div>
             )}

             {/* Thumbnail Gallery */}
             {selectedImages.length > 0 && (
               <div style={{ 
                 display: 'flex', 
                 gap: '10px', 
                 justifyContent: 'center',
                 flexWrap: 'wrap',
                 marginBottom: '20px'
               }}>
                 {selectedImages.map((image, index) => (
                   <div key={index} style={{ position: 'relative' }}>
                     <img 
                       src={image} 
                       alt={`Thumbnail ${index + 1}`} 
                       onClick={() => setCurrentImageIndex(index)}
                       style={{ 
                         width: '80px', 
                         height: '60px', 
                         objectFit: 'cover',
                         borderRadius: '6px',
                         cursor: 'pointer',
                         border: index === currentImageIndex ? '3px solid #007bff' : '1px solid #ddd',
                         opacity: index === currentImageIndex ? 1 : 0.7
                       }} 
                     />
                                           {imageType === 'project' && selectedProject.status === 'pending' && (
                        <button
                          onClick={() => handleRemoveImageInModal(index)}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      )}
                   </div>
                 ))}
               </div>
             )}

                           {/* Add Image Section - Sadece Layihə Şəkilləri için ve proje bekliyor durumunda */}
              {imageType === 'project' && selectedProject.status === 'pending' && (
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <label style={{ 
                    display: 'inline-block',
                    background: '#007bff',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <Camera size={16} style={{ marginRight: '8px' }} />
                    Yeni Resim Ekle
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAddImageInModal}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
           </div>
         </div>
       )}

      {/* Info Modal */}
      {showInfoModal && selectedProject && (() => {
        const meeting = meetings.find(m => m.id === selectedProject.meetingId)
        const inquiry = meeting ? inquiries.find(i => i.id === meeting.inquiryId) : null
        
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
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#333', margin: 0 }}>Layihə Məlumatları</h2>
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
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Görüşmə Məlumatları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ziyarətçi:</strong> {meeting?.visitorName || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ziyarət Tarixi:</strong> {meeting ? new Date(meeting.visitDate).toLocaleDateString('tr-TR') : 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Konum:</strong> {meeting?.visitLocation || 'Məlumat yoxdur'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ tərəf */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Layihə Detalları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Layihə ID:</strong> {selectedProject.id}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          marginLeft: '8px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: selectedProject.status === 'pending' ? '#fff3cd' : '#d4edda',
                          color: selectedProject.status === 'pending' ? '#856404' : '#155724'
                        }}>
                          {selectedProject.status === 'pending' ? 'Gözləyir' : 'Tamamlandı'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Layihə Şəkilləri:</strong> {(selectedProject.projectImages && selectedProject.projectImages.length) || 0}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Rəf Növü:</strong> {selectedMeeting && selectedMeeting.shelfType ? selectedMeeting.shelfType : 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>PDF Faylı:</strong> {selectedProject.projectPdf ? 'Mövcuddur' : 'Yoxdur'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Qeydlər</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Layihə Qeydləri:</strong> {selectedProject.projectNotes || 'Qeyd yoxdur'}
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

      {/* PDF Viewer Modal */}
      {showPdfModal && selectedProject && selectedProject.projectPdf && (
         <div 
           className="modal-overlay" 
           onClick={() => setShowPdfModal(false)}
           style={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'rgba(0, 0, 0, 0.9)',
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
               background: 'transparent',
               padding: '20px',
               borderRadius: '15px',
               width: '95%',
               maxWidth: '1200px',
               maxHeight: '95vh',
               position: 'relative'
             }}
           >
             {/* Header */}
             <div style={{ 
               display: 'flex', 
               justifyContent: 'space-between', 
               alignItems: 'center', 
               marginBottom: '20px',
               color: 'white'
             }}>
               <h2 style={{ margin: 0, color: 'white' }}>
                 Proje PDF Faylı
               </h2>
               <button 
                 onClick={() => setShowPdfModal(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '2rem',
                   cursor: 'pointer',
                   color: 'white'
                 }}
               >
                 <X />
               </button>
             </div>

             {/* PDF Viewer */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               marginBottom: '20px',
               position: 'relative',
               background: 'white',
               borderRadius: '8px',
               overflow: 'hidden'
             }}>
               <iframe
                 src={selectedProject.projectPdf}
                 style={{
                   width: '100%',
                   height: '80vh',
                   border: 'none'
                 }}
                 title="PDF Viewer"
               />
             </div>

             {/* Download Button */}
             <div style={{ 
               textAlign: 'center',
               padding: '20px',
               background: 'rgba(255, 255, 255, 0.1)',
               borderRadius: '8px',
               marginTop: '20px'
             }}>
               <a
                 href={selectedProject.projectPdf}
                 download="proje_dosyasi.pdf"
                 style={{
                   display: 'inline-block',
                   background: '#007bff',
                   color: 'white',
                   padding: '12px 20px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: '500',
                   textDecoration: 'none'
                 }}
               >
                 <Download size={16} style={{ marginRight: '8px' }} />
                 PDF İndir
               </a>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }

export default ProjectsPage

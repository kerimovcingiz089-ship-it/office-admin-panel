import React, { useState } from 'react'
import { Plus, Edit, Trash2, Search, X, Phone, Mail, MapPin, Building, Camera, Calendar, CheckCircle, Clock, FileText, Download, Eye, DollarSign, Package, FileText as FileTextIcon, Factory, Info } from 'lucide-react'

function PricingPage() {
  // localStorage'dan fiyatlandırma verilerini yükle
  const getInitialPricing = () => {
    const savedPricing = localStorage.getItem('officePricing')
    if (savedPricing) {
      return JSON.parse(savedPricing)
    }
    return []
  }

  // localStorage-dan tamamlanan layihə məlumatlarını al
  const getCompletedProjects = () => {
    const savedProjects = localStorage.getItem('officeProjects')
    if (savedProjects) {
      const projects = JSON.parse(savedProjects)
      return projects.filter(project => project.status === 'completed')
    }
    return []
  }

  // Henüz fiyatlandırması yapılmamış projeleri al
  const getAvailableProjects = () => {
    const completedProjects = getCompletedProjects()
    const existingPricing = getInitialPricing()
    
    // Mevcut fiyatlandırmalarda kullanılan proje ID'lerini al
    const usedProjectIds = existingPricing.map(pricing => pricing.projectId)
    
    // Hələ qiymətləndirməsi edilməmiş layihələri filtrlə
    return completedProjects.filter(project => !usedProjectIds.includes(project.id))
  }

  // localStorage'dan görüşme verilerini al
  const getMeetings = () => {
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

  // localStorage təmizləmə funksiyası
  const clearOldPricingData = () => {
    try {
      const currentPricing = JSON.parse(localStorage.getItem('officePricing') || '[]')
      // Yalnız son 30 qiymətləndirməni saxla
      const recentPricing = currentPricing.slice(-30)
      localStorage.setItem('officePricing', JSON.stringify(recentPricing))
      setPricing(recentPricing)
      alert('Köhnə qiymətləndirmələr təmizləndi. Yalnız son 30 qiymətləndirmə saxlanıldı.')
    } catch (error) {
      console.error('localStorage təmizləmə xətası:', error)
      alert('localStorage təmizləmə xətası baş verdi.')
    }
  }

  const [pricing, setPricing] = useState(getInitialPricing)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedPricing, setSelectedPricing] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageType, setImageType] = useState('project') // 'project' or 'meeting'
  const [newPricing, setNewPricing] = useState({
    projectId: '',
    price: '',
    weight: '',
    weightUnit: 'kg', // kg, ton, gr
    productionStartDate: '', // İstehsalat başlama tarixi
    productionEndDate: '', // İstehsalat bitmə tarixi
    pricingPdf: null,
    pricingNotes: '',
    status: 'pending', // pending, completed
    sentToProduction: false // İstehsalata göndərilib ya yox
  })

  const completedProjects = getCompletedProjects()
  const availableProjects = getAvailableProjects()
  const meetings = getMeetings()
  const inquiries = getInquiries()
  
  // Tüm projects verilerini al (sadece completed değil)
  const getProjects = () => {
    const savedProjects = localStorage.getItem('officeProjects')
    if (savedProjects) {
      return JSON.parse(savedProjects)
    }
    return []
  }
  const projects = getProjects()

  // Qiymətləndirmələri filtrlə
  const filteredPricing = pricing.filter(pricingItem => {
    const project = completedProjects.find(p => p.id === pricingItem.projectId)
    if (!project) return false
    
    const meeting = meetings.find(m => m.id === project.meetingId)
    if (!meeting) return false
    
    const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
    if (!inquiry) return false
    
    return (
      inquiry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pricingItem.price.toString().includes(searchTerm) ||
      pricingItem.weight.toString().includes(searchTerm)
    )
  })

  // İstehsalata göndərmə funksiyası
  const handleSendToProduction = (pricingItem) => {
    const project = completedProjects.find(p => p.id === pricingItem.projectId)
    if (!project) return
    
    const meeting = meetings.find(m => m.id === project.meetingId)
    if (!meeting) return
    
    const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
    if (!inquiry) return

    // Mövcud istehsalat verilərini al
    const existingProduction = localStorage.getItem('officeProduction')
    const production = existingProduction ? JSON.parse(existingProduction) : []

    // Yeni istehsalat sifarişi yarat
    const newProductionOrder = {
      id: Math.max(...production.map(p => p.id), 0) + 1,
      projectId: pricingItem.projectId,
      productName: `${inquiry.firstName} ${inquiry.lastName} - ${inquiry.companyName || 'Şəxsi'}`,
      quantity: pricingItem.weight,
      unit: pricingItem.weightUnit,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'planlaşdırılıb',
      priority: 'orta',
      notes: `Qiymətləndirmə ID: ${pricingItem.id}\nQiymət: $${pricingItem.price}\nLayihə qeydləri: ${project.projectNotes || 'Qeyd yoxdur'}`,
      assignedWorkers: [],
      materials: [],
      qualityChecks: [],
      createdAt: new Date().toISOString().split('T')[0],
      pricingId: pricingItem.id
    }

    // İstehsalat verilərinə əlavə et
    const updatedProduction = [...production, newProductionOrder]
    localStorage.setItem('officeProduction', JSON.stringify(updatedProduction))

    // Qiymətləndirmə statusunu "tamamlandı" et və istehsalata göndərildi qeydini qoy
    const updatedPricing = pricing.map(item => 
      item.id === pricingItem.id ? { ...item, status: 'completed', sentToProduction: true } : item
    )
    setPricing(updatedPricing)
    localStorage.setItem('officePricing', JSON.stringify(updatedPricing))

    // Inquiry status'unu 'production' yap
    const savedInquiries = localStorage.getItem('officeInquiries')
    if (savedInquiries) {
      const inquiries = JSON.parse(savedInquiries)
      const updatedInquiries = inquiries.map(inquiry => {
        if (inquiry.id === parseInt(meeting.inquiryId)) {
          return { ...inquiry, status: 'production' }
        }
        return inquiry
      })
      localStorage.setItem('officeInquiries', JSON.stringify(updatedInquiries))
      
              // HomePage-in yenilənməsi üçün custom event göndər
      window.dispatchEvent(new CustomEvent('inquiriesUpdated', {
        detail: { updatedInquiries }
      }))
    }

    // İstehsalat səhifəsinə yönləndir
    window.location.href = '/production'
  }

  // Qiymətləndirmə əlavə etmə
  const handleAddPricing = () => {
    if (newPricing.projectId && newPricing.price && newPricing.weight) {
      const pricingToAdd = {
        ...newPricing,
        id: Math.max(...pricing.map(p => p.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      }
      const updatedPricing = [...pricing, pricingToAdd]
      setPricing(updatedPricing)
      
      try {
        localStorage.setItem('officePricing', JSON.stringify(updatedPricing))
      } catch (error) {
        console.error('localStorage quota exceeded:', error)
        // localStorage-də çox məlumat var, köhnə məlumatları təmizlə
        const pricingData = JSON.stringify(updatedPricing)
        if (pricingData.length > 5000000) { // 5MB-dan çox
          // Yalnız son 50 qiymətləndirməni saxla
          const recentPricing = updatedPricing.slice(-50)
          localStorage.setItem('officePricing', JSON.stringify(recentPricing))
          setPricing(recentPricing)
          alert('Çox məlumat olduğu üçün köhnə qiymətləndirmələr silindi. Yalnız son 50 qiymətləndirmə saxlanıldı.')
        } else {
          alert('localStorage-də yer yoxdur. Bəzi məlumatları silməlisiniz.')
        }
      }
      
      setNewPricing({
        projectId: '',
        price: '',
        weight: '',
        weightUnit: 'kg',
        productionStartDate: '',
        productionEndDate: '',
        pricingPdf: null,
        pricingNotes: '',
        status: 'pending',
        sentToProduction: false
      })
      setShowAddModal(false)
    }
  }

  // Qiymətləndirmə yeniləmə
  const handleUpdatePricing = () => {
    if (newPricing.projectId && newPricing.price && newPricing.weight) {
      const updatedPricing = pricing.map(pricingItem => 
        pricingItem.id === selectedPricing.id ? { ...pricingItem, ...newPricing } : pricingItem
      )
      setPricing(updatedPricing)
      
      try {
        localStorage.setItem('officePricing', JSON.stringify(updatedPricing))
      } catch (error) {
        console.error('localStorage quota exceeded:', error)
        // localStorage-də çox məlumat var, köhnə məlumatları təmizlə
        const pricingData = JSON.stringify(updatedPricing)
        if (pricingData.length > 5000000) { // 5MB-dan çox
          // Yalnız son 50 qiymətləndirməni saxla
          const recentPricing = updatedPricing.slice(-50)
          localStorage.setItem('officePricing', JSON.stringify(recentPricing))
          setPricing(recentPricing)
          alert('Çox məlumat olduğu üçün köhnə qiymətləndirmələr silindi. Yalnız son 50 qiymətləndirmə saxlanıldı.')
        } else {
          alert('localStorage-də yer yoxdur. Bəzi məlumatları silməlisiniz.')
        }
      }
      
              // Qiymətləndirmə tamamlandığında inquiry statusunu dəyişdirmə
              // Yalnız "İstehsalata Göndər" düyməsinə basıldığında dəyişəcək
      
      setShowEditModal(false)
      setSelectedPricing(null)
      setNewPricing({
        projectId: '',
        price: '',
        weight: '',
        weightUnit: 'kg',
        productionStartDate: '',
        productionEndDate: '',
        pricingPdf: null,
        pricingNotes: '',
        status: 'pending',
        sentToProduction: false
      })
    }
  }

  // Qiymətləndirmə silmə
  const handleDeletePricing = (pricingItem) => {
    setSelectedPricing(pricingItem)
    setShowDeleteModal(true)
  }

  const confirmDeletePricing = () => {
    const updatedPricing = pricing.filter(pricingItem => pricingItem.id !== selectedPricing.id)
    setPricing(updatedPricing)
    localStorage.setItem('officePricing', JSON.stringify(updatedPricing))
    setShowDeleteModal(false)
    setSelectedPricing(null)
  }

  // Qiymətləndirmə düzənləmə
  const handleEditPricing = (pricingItem) => {
    setSelectedPricing(pricingItem)
    setNewPricing({
      projectId: pricingItem.projectId,
      price: pricingItem.price,
      weight: pricingItem.weight,
      weightUnit: pricingItem.weightUnit || 'kg',
      productionStartDate: pricingItem.productionStartDate || '',
      productionEndDate: pricingItem.productionEndDate || '',
      pricingPdf: pricingItem.pricingPdf || null,
      pricingNotes: pricingItem.pricingNotes || '',
      status: pricingItem.status,
      sentToProduction: pricingItem.sentToProduction || false
    })
    setShowEditModal(true)
  }

  // Proje seçimi
  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setNewPricing(prev => ({
      ...prev,
      projectId: project.id
    }))
  }

  // PDF yükleme
  const handlePdfUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPricing(prev => ({
          ...prev,
          pricingPdf: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

      // PDF silmə
    const handleRemovePdf = () => {
    setNewPricing(prev => ({
      ...prev,
      pricingPdf: null
    }))
  }

      // Layihə detallarını göstərmə
    const handleViewProjectDetails = (project) => {
    setSelectedProject(project)
    setShowProjectDetailsModal(true)
  }

  // Şəkilləri göstərmə
  const handleViewImages = (images, type) => {
    setSelectedImages(images || [])
    setImageType(type)
    setCurrentImageIndex(0)
    setShowImageModal(true)
  }

  // Şəkil naviqasiyası
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === selectedImages.length - 1 ? 0 : prev + 1
    )
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedImages.length - 1 : prev - 1
    )
  }

  // PDF yükləmə
  const handleDownloadPdf = (pdfData, filename) => {
    const link = document.createElement('a')
    link.href = pdfData
    link.download = filename || 'layihə-faylı.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>

      <div className="users-section">
                 <div className="users-header">
           <h3>Qiymətləndirmə Qeydləri</h3>
           <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
             <Plus size={16} style={{ marginRight: '8px' }} />
             Yeni Qiymətləndirmə Əlavə Et
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
                             placeholder="Qiymətləndirmə axtar..."
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
               <th>Layihə Tarixi</th>
               <th>Qiymət</th>
               <th>Çəki</th>
               <th>İstehsalat Başlama Tarixi</th>
              <th>İstehsalat Bitmə Tarixi</th>
               <th>Rəfin növü</th>
               <th>Vəziyyət</th>
               <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredPricing.map(pricingItem => {
              const project = completedProjects.find(p => p.id === pricingItem.projectId)
              if (!project) return null
              
              const meeting = meetings.find(m => m.id === project.meetingId)
              if (!meeting) return null
              
              const inquiry = inquiries.find(i => i.id === meeting.inquiryId)
              if (!inquiry) return null

              return (
                <tr key={pricingItem.id}>
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
                          setSelectedPricing(pricingItem)
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
                      <span>{new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#28a745' }}>
                        {pricingItem.price} USD
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Package size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span>
                        {pricingItem.weight} {pricingItem.weightUnit}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Calendar size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span style={{ fontSize: '0.8rem' }}>
                        {pricingItem.productionStartDate || '-'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Calendar size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span style={{ fontSize: '0.8rem' }}>
                        {pricingItem.productionEndDate || '-'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Building size={14} style={{ marginRight: '6px', color: '#666' }} />
                      <span style={{ fontSize: '0.8rem', color: '#333' }}>
                        {meeting.shelfType || 'Məlumat yoxdur'}
                      </span>
                    </div>
                  </td>
                  <td>
                                         <span className={`user-status ${pricingItem.status}`}>
                       {pricingItem.status === 'pending' ? 'Gözləyir' : 'Tamamlandı'}
                     </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {pricingItem.status === 'pending' && (
                        <button 
                          onClick={() => handleEditPricing(pricingItem)}
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
                      {pricingItem.status === 'pending' && (
                        <button 
                          onClick={() => handleDeletePricing(pricingItem)}
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
                      {pricingItem.sentToProduction ? (
                        <span style={{ 
                          color: '#28a745', 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle size={14} />
                          İstehsalata verildi
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSendToProduction(pricingItem)}
                          style={{
                            background: pricingItem.status === 'completed' 
                              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={pricingItem.status === 'completed' ? "Tamamlanmış Qiymətləndirməni İstehsalata Göndər" : "İstehsalata Göndər"}
                        >
                          <Factory size={14} />
                          <span style={{ fontSize: '0.7rem' }}>
                            {pricingItem.status === 'completed' ? 'İstehsalat (Tamamlandı)' : 'İstehsalat'}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredPricing.length === 0 && (
                     <div style={{ 
             textAlign: 'center', 
             padding: '40px', 
             color: '#666',
             fontSize: '1.1rem'
           }}>
             Axtarış kriterlərinə uyğun qiymətləndirmə tapılmadı.
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
              {pricing.length}
            </div>
                         <div style={{ color: '#666', marginTop: '5px' }}>Ümumi Qiymətləndirmə</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {pricing.filter(p => p.status === 'pending').length}
            </div>
                         <div style={{ color: '#666', marginTop: '5px' }}>Gözləyən Qiymətləndirmə</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {pricing.filter(p => p.status === 'completed').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Tamamlanan</div>
          </div>
        </div>


      </div>

      {/* Add Pricing Modal */}
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni Qiymətləndirmə Əlavə Et</h2>
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

            {/* Tamamlanan Layihə Seçimi */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
                Tamamlanan Layihə Seçimi *
              </label>
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                padding: '10px'
              }}>
                {availableProjects.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    {completedProjects.length === 0 ? 
                      'Tamamlanan layihə tapılmadı. Əvvəlcə "Layihələndirmə" bölməsindən layihə tamamlayın.' :
                      'Bütün tamamlanan layihələr üçün qiymətləndirmə yaradılmış. Yeni qiymətləndirmə əlavə etmək üçün əvvəlcə yeni layihə tamamlayın.'
                    }
                  </div>
                ) : (
                  availableProjects.map(project => {
                    const meeting = meetings.find(m => m.id === project.meetingId)
                    const inquiry = meeting ? inquiries.find(i => i.id === meeting.inquiryId) : null
                    if (!meeting || !inquiry) return null
                    
                    return (
                      <div
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        style={{
                          padding: '10px',
                          border: newPricing.projectId === project.id ? '2px solid #667eea' : '1px solid #eee',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          background: newPricing.projectId === project.id ? '#f8f9ff' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          {inquiry.firstName} {inquiry.lastName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {inquiry.companyName || 'Şirkət məlumatı yoxdur'}
                        </div>
                                                 <div style={{ fontSize: '0.8rem', color: '#999' }}>
                           Ziyarətçi: {meeting.visitorName} | Layihə Tarixi: {new Date(project.createdAt).toLocaleDateString('az-AZ')}
                         </div>
                         <div style={{ marginTop: '8px' }}>
                           <button
                             onClick={() => handleViewProjectDetails(project)}
                             style={{
                               background: '#007bff',
                               color: 'white',
                               border: 'none',
                               padding: '6px 12px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.8rem'
                             }}
                           >
                             <Eye size={12} style={{ marginRight: '4px' }} />
                             Təfərrüatları Görüntülə
                           </button>
                         </div>
                       </div>
                     )
                   })
                 )}
               </div>
             </div>

            {/* Seçilən Layihə Məlumatları */}
            {selectedProject && (() => {
              const meeting = meetings.find(m => m.id === selectedProject.meetingId)
              const inquiry = meeting ? inquiries.find(i => i.id === meeting.inquiryId) : null
              return meeting && inquiry ? (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Müştəri və Layihə Məlumatları</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Müştəri: {inquiry.firstName} {inquiry.lastName}</div>
                      <div style={{ color: '#666' }}>Şirkət: {inquiry.companyName || 'Məlumat yoxdur'}</div>
                      <div style={{ color: '#666' }}>Telefon: {inquiry.phone}</div>
                      <div style={{ color: '#666' }}>E-poçt: {inquiry.email}</div>
                    </div>
                                         <div>
                       <div style={{ fontWeight: '600' }}>Ziyarətçi: {meeting.visitorName}</div>
                       <div style={{ color: '#666' }}>Layihə Tarixi: {new Date(selectedProject.createdAt).toLocaleDateString('az-AZ')}</div>
                       <div style={{ color: '#666' }}>
                         Layihə Şəkilləri: {(selectedProject.projectImages && selectedProject.projectImages.length) || 0} ədəd
                         {(selectedProject.projectImages && selectedProject.projectImages.length > 0) && (
                           <button
                             onClick={() => handleViewImages(selectedProject.projectImages, 'project')}
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
                             <Eye size={10} style={{ marginRight: '4px' }} />
                             Görüntülə
                           </button>
                         )}
                       </div>
                       <div style={{ color: '#666' }}>
                         Görüşmə Şəkilləri: {(selectedProject.meetingImages && selectedProject.meetingImages.length) || 0} ədəd
                         {(selectedProject.meetingImages && selectedProject.meetingImages.length > 0) && (
                           <button
                             onClick={() => handleViewImages(selectedProject.meetingImages, 'meeting')}
                             style={{
                               background: '#17a2b8',
                               color: 'white',
                               border: 'none',
                               padding: '4px 8px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               marginLeft: '8px'
                             }}
                           >
                             <Eye size={10} style={{ marginRight: '4px' }} />
                             Görüntülə
                           </button>
                         )}
                       </div>
                       <div style={{ color: '#666' }}>
                         Layihə PDF: {selectedProject.projectPdf ? 'Var' : 'Yoxdur'}
                         {selectedProject.projectPdf && (
                           <button
                             onClick={() => handleDownloadPdf(selectedProject.projectPdf, 'proje-dosyasi.pdf')}
                             style={{
                               background: '#ffc107',
                               color: 'white',
                               border: 'none',
                               padding: '4px 8px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               marginLeft: '8px'
                             }}
                           >
                             <Download size={10} style={{ marginRight: '4px' }} />
                             Yüklə
                           </button>
                         )}
                       </div>
                     </div>
                  </div>
                </div>
              ) : null
            })()}

            {/* Qiymət */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymət ($) *
              </label>
              <input
                type="number"
                value={newPricing.price}
                onChange={(e) => setNewPricing(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
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

            {/* Ağırlık */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Ağırlık *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={newPricing.weight}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="0"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <select
                  value={newPricing.weightUnit}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, weightUnit: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="gr">gr</option>
                </select>
              </div>
            </div>

            {/* İstehsalat Başlama Tarixi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                İstehsalat Başlama Tarixi
              </label>
              <input
                type="date"
                value={newPricing.productionStartDate}
                onChange={(e) => setNewPricing(prev => ({ ...prev, productionStartDate: e.target.value }))}
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

            {/* İstehsalat Bitmə Tarixi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                İstehsalat Bitmə Tarixi
              </label>
              <input
                type="date"
                value={newPricing.productionEndDate}
                onChange={(e) => setNewPricing(prev => ({ ...prev, productionEndDate: e.target.value }))}
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

            {/* PDF Təklifi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymət Təklifi PDF
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
              {newPricing.pricingPdf && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#e9ecef', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileTextIcon size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span style={{ fontSize: '0.9rem' }}>PDF faylı yükləndi</span>
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
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Qiymətləndirmə Qeydləri */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymətləndirmə Qeydləri
              </label>
              <textarea
                value={newPricing.pricingNotes}
                onChange={(e) => setNewPricing(prev => ({ ...prev, pricingNotes: e.target.value }))}
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
                placeholder="Qiymətləndirmə haqqında qeydlər"
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
                Ləğv Et
              </button>
              <button
                onClick={handleAddPricing}
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
                Qiymətləndirmə Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pricing Modal */}
      {showEditModal && selectedPricing && (
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
              <h2 style={{ color: '#333', margin: 0 }}>Qiymətləndirmə Düzənlə</h2>
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

            {/* Layihə Məlumatı */}
            {(() => {
              const project = completedProjects.find(p => p.id === newPricing.projectId)
              const meeting = project ? meetings.find(m => m.id === project.meetingId) : null
              const inquiry = meeting ? inquiries.find(i => i.id === meeting.inquiryId) : null
              return project && meeting && inquiry ? (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Müştəri və Layihə Məlumatları</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Müştəri: {inquiry.firstName} {inquiry.lastName}</div>
                      <div style={{ color: '#666' }}>Şirkət: {inquiry.companyName || 'Məlumat yoxdur'}</div>
                      <div style={{ color: '#666' }}>Telefon: {inquiry.phone}</div>
                      <div style={{ color: '#666' }}>E-poçt: {inquiry.email}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Ziyarətçi: {meeting.visitorName}</div>
                      <div style={{ color: '#666' }}>Layihə Tarixi: {new Date(project.createdAt).toLocaleDateString('az-AZ')}</div>
                      <div style={{ color: '#666' }}>Layihə Şəkilləri: {(project.projectImages && project.projectImages.length) || 0} ədəd</div>
                      <div style={{ color: '#666' }}>Layihə PDF: {project.projectPdf ? 'Var' : 'Yoxdur'}</div>
                    </div>
                  </div>
                </div>
              ) : <div style={{ color: '#666' }}>Layihə məlumatı tapılmadı</div>
            })()}

            {/* Qiymət */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymət ($) *
              </label>
              <input
                type="number"
                value={newPricing.price}
                onChange={(e) => setNewPricing(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
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

            {/* Ağırlık */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Ağırlık *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={newPricing.weight}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="0"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <select
                  value={newPricing.weightUnit}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, weightUnit: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="gr">gr</option>
                </select>
              </div>
            </div>

            {/* İstehsalat Başlama Tarixi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                İstehsalat Başlama Tarixi
              </label>
              <input
                type="date"
                value={newPricing.productionStartDate}
                onChange={(e) => setNewPricing(prev => ({ ...prev, productionStartDate: e.target.value }))}
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

            {/* İstehsalat Bitmə Tarixi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                İstehsalat Bitmə Tarixi
              </label>
              <input
                type="date"
                value={newPricing.productionEndDate}
                onChange={(e) => setNewPricing(prev => ({ ...prev, productionEndDate: e.target.value }))}
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

            {/* PDF Təklifi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymət Təklifi PDF
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
              {newPricing.pricingPdf && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#e9ecef', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileTextIcon size={16} style={{ marginRight: '8px', color: '#666' }} />
                      <span style={{ fontSize: '0.9rem' }}>PDF faylı yükləndi</span>
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
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Qiymətləndirmə Qeydləri */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymətləndirmə Qeydləri
              </label>
              <textarea
                value={newPricing.pricingNotes}
                onChange={(e) => setNewPricing(prev => ({ ...prev, pricingNotes: e.target.value }))}
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
                placeholder="Qiymətləndirmə haqqında qeydlər"
              />
            </div>

            {/* Vəziyyət */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Vəziyyət
              </label>
              <select
                value={newPricing.status}
                onChange={(e) => setNewPricing(prev => ({ ...prev, status: e.target.value }))}
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
                <option value="pending">Gözləyir</option>
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
                onClick={handleUpdatePricing}
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
      {showDeleteModal && selectedPricing && (
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
              <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>Qiymətləndirməni Sil</h2>
              <p style={{ color: '#666', margin: 0 }}>
                Bu qiymətləndirmə qeydini silmək istədiyinizdən əmin misiniz?
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
                onClick={confirmDeletePricing}
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
                Qiymətləndirməni Sil
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* Proje Detayları Modal */}
       {showProjectDetailsModal && selectedProject && (
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
             maxWidth: '1000px',
             maxHeight: '90vh',
             overflowY: 'auto',
             boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h2 style={{ color: '#333', margin: 0 }}>Layihə Təfərrüatları</h2>
               <button 
                 onClick={() => setShowProjectDetailsModal(false)}
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

             {(() => {
               const meeting = meetings.find(m => m.id === selectedProject.meetingId)
               const inquiry = meeting ? inquiries.find(i => i.id === meeting.inquiryId) : null
               return meeting && inquiry ? (
                 <div>
                   {/* Müştəri Bilgileri */}
                   <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                     <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Müştəri Bilgileri</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Ad Soyad:</div>
                         <div style={{ color: '#666' }}>{inquiry.firstName} {inquiry.lastName}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Şirket:</div>
                         <div style={{ color: '#666' }}>{inquiry.companyName || 'Bilgi yok'}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Telefon:</div>
                         <div style={{ color: '#666' }}>{inquiry.phone}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>E-posta:</div>
                         <div style={{ color: '#666' }}>{inquiry.email}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Adres:</div>
                         <div style={{ color: '#666' }}>{inquiry.address || 'Bilgi yok'}</div>
                       </div>
                     </div>
                   </div>

                   {/* Görüşme Bilgileri */}
                   <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                     <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Görüşme Bilgileri</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Ziyarətçi:</div>
                         <div style={{ color: '#666' }}>{meeting.visitorName}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Görüşme Tarihi:</div>
                         <div style={{ color: '#666' }}>{new Date(meeting.createdAt).toLocaleDateString('tr-TR')}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Konum:</div>
                         <div style={{ color: '#666' }}>{meeting.location || 'Bilgi yok'}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Görüşme Notları:</div>
                         <div style={{ color: '#666' }}>{meeting.notes || 'Not yok'}</div>
                       </div>
                     </div>
                   </div>

                   {/* Proje Bilgileri */}
                   <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                     <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Proje Bilgileri</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Proje Tarihi:</div>
                         <div style={{ color: '#666' }}>{new Date(selectedProject.createdAt).toLocaleDateString('tr-TR')}</div>
                       </div>
                       <div>
                         <div style={{ fontWeight: '600', marginBottom: '5px' }}>Proje Notları:</div>
                         <div style={{ color: '#666' }}>{selectedProject.projectNotes || 'Not yok'}</div>
                       </div>
                     </div>
                   </div>

                   {/* Dosyalar */}
                   <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                     <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Dosyalar</h3>
                     
                     {/* Görüşme Resimleri */}
                     <div style={{ marginBottom: '15px' }}>
                       <div style={{ fontWeight: '600', marginBottom: '10px' }}>
                         Görüşme Resimleri ({selectedProject.meetingImages ? selectedProject.meetingImages.length : 0} adet)
                       </div>
                       {selectedProject.meetingImages && selectedProject.meetingImages.length > 0 ? (
                         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                           {selectedProject.meetingImages.slice(0, 3).map((image, index) => (
                             <img
                               key={index}
                               src={image}
                               alt={`Görüşme ${index + 1}`}
                               style={{
                                 width: '80px',
                                 height: '80px',
                                 objectFit: 'cover',
                                 borderRadius: '6px',
                                 cursor: 'pointer'
                               }}
                               onClick={() => handleViewImages(selectedProject.meetingImages, 'meeting')}
                             />
                           ))}
                           {selectedProject.meetingImages.length > 3 && (
                             <div
                               style={{
                                 width: '80px',
                                 height: '80px',
                                 background: '#e9ecef',
                                 borderRadius: '6px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 cursor: 'pointer',
                                 fontSize: '0.8rem',
                                 color: '#666'
                               }}
                               onClick={() => handleViewImages(selectedProject.meetingImages, 'meeting')}
                             >
                               +{selectedProject.meetingImages.length - 3} daha
                             </div>
                           )}
                         </div>
                       ) : (
                         <div style={{ color: '#666', fontStyle: 'italic' }}>Görüşme resmi yok</div>
                       )}
                     </div>

                     {/* Layihə Şəkilləri */}
                     <div style={{ marginBottom: '15px' }}>
                       <div style={{ fontWeight: '600', marginBottom: '10px' }}>
                         Layihə Şəkilləri ({selectedProject.projectImages ? selectedProject.projectImages.length : 0} adet)
                       </div>
                       {selectedProject.projectImages && selectedProject.projectImages.length > 0 ? (
                         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                           {selectedProject.projectImages.slice(0, 3).map((image, index) => (
                             <img
                               key={index}
                               src={image}
                               alt={`Proje ${index + 1}`}
                               style={{
                                 width: '80px',
                                 height: '80px',
                                 objectFit: 'cover',
                                 borderRadius: '6px',
                                 cursor: 'pointer'
                               }}
                               onClick={() => handleViewImages(selectedProject.projectImages, 'project')}
                             />
                           ))}
                           {selectedProject.projectImages.length > 3 && (
                             <div
                               style={{
                                 width: '80px',
                                 height: '80px',
                                 background: '#e9ecef',
                                 borderRadius: '6px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 cursor: 'pointer',
                                 fontSize: '0.8rem',
                                 color: '#666'
                               }}
                               onClick={() => handleViewImages(selectedProject.projectImages, 'project')}
                             >
                               +{selectedProject.projectImages.length - 3} daha
                             </div>
                           )}
                         </div>
                       ) : (
                         <div style={{ color: '#666', fontStyle: 'italic' }}>layihə şəkli yok</div>
                       )}
                     </div>

                     {/* Proje PDF */}
                     <div>
                       <div style={{ fontWeight: '600', marginBottom: '10px' }}>Proje PDF</div>
                       {selectedProject.projectPdf ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <FileTextIcon size={20} color="#666" />
                           <span style={{ color: '#666' }}>Proje dosyası mevcut</span>
                           <button
                             onClick={() => handleDownloadPdf(selectedProject.projectPdf, 'proje-dosyasi.pdf')}
                             style={{
                               background: '#007bff',
                               color: 'white',
                               border: 'none',
                               padding: '6px 12px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.8rem'
                             }}
                           >
                             <Download size={12} style={{ marginRight: '4px' }} />
                             İndir
                           </button>
                         </div>
                       ) : (
                         <div style={{ color: '#666', fontStyle: 'italic' }}>Proje PDF Faylı yok</div>
                       )}
                     </div>
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                     <button
                       onClick={() => setShowProjectDetailsModal(false)}
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
                       Kapat
                     </button>
                   </div>
                 </div>
               ) : (
                 <div style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                   Proje bilgileri bulunamadı
                 </div>
               )
             })()}
           </div>
         </div>
       )}

       {/* Resim Görüntüleme Modal */}
      {/* Info Modal */}
      {showInfoModal && selectedPricing && (() => {
        const project = projects.find(p => p.id === selectedPricing.projectId)
        const meeting = project ? meetings.find(m => m.id === project.meetingId) : null
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
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#333', margin: 0 }}>Qiymətləndirmə Məlumatları</h2>
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
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Layihə Məlumatları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Layihə ID:</strong> {project?.id || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ziyarətçi:</strong> {meeting?.visitorName || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Layihə Tarixi:</strong> {project ? new Date(project.createdAt).toLocaleDateString('tr-TR') : 'Məlumat yoxdur'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ tərəf */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Qiymətləndirmə Detalları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Qiymətləndirmə ID:</strong> {selectedPricing.id}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Qiymət:</strong> {selectedPricing.price} USD
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Çəki:</strong> {selectedPricing.weight} {selectedPricing.weightUnit}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          marginLeft: '8px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: selectedPricing.status === 'pending' ? '#fff3cd' : '#d4edda',
                          color: selectedPricing.status === 'pending' ? '#856404' : '#155724'
                        }}>
                          {selectedPricing.status === 'pending' ? 'Gözləyir' : 'Tamamlandı'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>İstehsalata Göndərilib:</strong> 
                        <span style={{ 
                          marginLeft: '8px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: selectedPricing.sentToProduction ? '#d4edda' : '#f8d7da',
                          color: selectedPricing.sentToProduction ? '#155724' : '#721c24'
                        }}>
                          {selectedPricing.sentToProduction ? 'Bəli' : 'Xeyr'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Tarix və Qeydlər</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>İstehsalat Başlama:</strong> {selectedPricing.productionStartDate || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>İstehsalat Bitmə:</strong> {selectedPricing.productionEndDate || 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Rəfin növü:</strong> 
                        {selectedMeeting && selectedMeeting.shelfType ? selectedMeeting.shelfType : 'Məlumat yoxdur'}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Qiymətləndirmə Qeydləri:</strong> {selectedPricing.pricingNotes || 'Qeyd yoxdur'}
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

      {/* Image Viewer Modal */}
      {showImageModal && selectedImages.length > 0 && (
         <div className="modal-overlay" style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.9)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1001
         }}>
           <div className="modal-content" style={{
             background: 'transparent',
             padding: '20px',
             borderRadius: '15px',
             width: '90%',
             maxWidth: '800px',
             maxHeight: '90vh',
             position: 'relative'
           }}>
             {/* Modal Header */}
             <div style={{ 
               display: 'flex', 
               justifyContent: 'space-between', 
               alignItems: 'center', 
               marginBottom: '20px',
               color: 'white'
             }}>
               <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                 {imageType === 'project' ? 'Layihə Şəkilləri' : 'Görüşme Resimleri'}
               </h2>
               <button 
                 onClick={() => setShowImageModal(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: 'white'
                 }}
               >
                 <X />
               </button>
             </div>

             {/* Main Image */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               marginBottom: '20px'
             }}>
               <button
                 onClick={handlePrevImage}
                 style={{
                   background: 'rgba(255, 255, 255, 0.2)',
                   border: 'none',
                   borderRadius: '50%',
                   width: '50px',
                   height: '50px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   color: 'white',
                   fontSize: '1.5rem',
                   marginRight: '20px'
                 }}
               >
                 ‹
               </button>
               
               <img
                 src={selectedImages[currentImageIndex]}
                 alt={`Resim ${currentImageIndex + 1}`}
                 style={{
                   maxWidth: '100%',
                   maxHeight: '60vh',
                   objectFit: 'contain',
                   borderRadius: '8px'
                 }}
               />
               
               <button
                 onClick={handleNextImage}
                 style={{
                   background: 'rgba(255, 255, 255, 0.2)',
                   border: 'none',
                   borderRadius: '50%',
                   width: '50px',
                   height: '50px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   color: 'white',
                   fontSize: '1.5rem',
                   marginLeft: '20px'
                 }}
               >
                 ›
               </button>
             </div>

             {/* Image Counter */}
             <div style={{ 
               textAlign: 'center', 
               color: 'white', 
               marginBottom: '20px',
               fontSize: '1.1rem'
             }}>
               {currentImageIndex + 1} / {selectedImages.length}
             </div>

             {/* Thumbnails */}
             <div style={{ 
               display: 'flex', 
               gap: '10px', 
               justifyContent: 'center',
               flexWrap: 'wrap'
             }}>
               {selectedImages.map((image, index) => (
                 <img
                   key={index}
                   src={image}
                   alt={`Thumbnail ${index + 1}`}
                   style={{
                     width: '60px',
                     height: '60px',
                     objectFit: 'cover',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     border: index === currentImageIndex ? '3px solid #007bff' : '1px solid #ddd',
                     opacity: index === currentImageIndex ? 1 : 0.7
                   }}
                   onClick={() => setCurrentImageIndex(index)}
                 />
               ))}
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }

export default PricingPage

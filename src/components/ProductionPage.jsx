import React, { useState } from 'react'
import { Plus, Edit, Search, X, Calendar, Clock, CheckCircle, AlertCircle, Package, Truck, Factory, Users, BarChart3, DollarSign, FileText, Eye, Download, Info } from 'lucide-react'

function ProductionPage() {
  // localStorage-dan istehsalat verilərini yüklə
  const getInitialProduction = () => {
    const savedProduction = localStorage.getItem('officeProduction')
    if (savedProduction) {
      return JSON.parse(savedProduction)
    }
    return []
  }

  // localStorage-dan qiymətləndirmə verilərini al
  const getPricingData = () => {
    const savedPricing = localStorage.getItem('officePricing')
    if (savedPricing) {
      return JSON.parse(savedPricing)
    }
    return []
  }

  // localStorage-dan layihə verilərini al
  const getProjectsData = () => {
    const savedProjects = localStorage.getItem('officeProjects')
    if (savedProjects) {
      return JSON.parse(savedProjects)
    }
    return []
  }

  const [production, setProduction] = useState(getInitialProduction)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [selectedProduction, setSelectedProduction] = useState(null)
  const [newProduction, setNewProduction] = useState({
    projectId: '',
    productName: '',
    quantity: '',
    unit: 'ədəd',
    startDate: '',
    endDate: '',
    status: 'planlaşdırılıb', // planlaşdırılıb, istehsalda, tamamlandı, dayandırılıb
    priority: 'orta', // aşağı, orta, yüksək
    notes: '',
    assignedWorkers: [],
    materials: [],
    qualityChecks: [],
    pricingId: null, // Qiymətləndirmə ID-si
    materialDetails: [] // İstifadə ediləcək material detalları
  })

  // Qiymətləndirmə verilərini al
  const pricingData = getPricingData()
  
  // Layihə verilərini al
  const projectsData = getProjectsData()

  // İstehsalatı filtrele
  const filteredProduction = production.filter(item => {
    return (
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.priority.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // İstehsalat əlavə etmə
  const handleAddProduction = () => {
    if (newProduction.productName && newProduction.quantity) {
      const productionToAdd = {
        ...newProduction,
        id: Math.max(...production.map(p => p.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      }
      const updatedProduction = [...production, productionToAdd]
      setProduction(updatedProduction)
      localStorage.setItem('officeProduction', JSON.stringify(updatedProduction))
      
      setNewProduction({
        projectId: '',
        productName: '',
        quantity: '',
        unit: 'ədəd',
        startDate: '',
        endDate: '',
        status: 'planlaşdırılıb',
        priority: 'orta',
        notes: '',
        assignedWorkers: [],
        materials: [],
        qualityChecks: [],
        pricingId: null,
        materialDetails: []
      })
      setShowAddModal(false)
    }
  }

  // İstehsalat yeniləmə
  const handleUpdateProduction = () => {
    if (newProduction.productName && newProduction.quantity) {
      const updatedProduction = production.map(item => 
        item.id === selectedProduction.id ? { ...item, ...newProduction } : item
      )
      setProduction(updatedProduction)
      localStorage.setItem('officeProduction', JSON.stringify(updatedProduction))
      
      setShowEditModal(false)
      setSelectedProduction(null)
      setNewProduction({
        projectId: '',
        productName: '',
        quantity: '',
        unit: 'ədəd',
        startDate: '',
        endDate: '',
        status: 'planlaşdırılıb',
        priority: 'orta',
        notes: '',
        assignedWorkers: [],
        materials: [],
        qualityChecks: [],
        pricingId: null,
        materialDetails: []
      })
    }
  }

  // Status dəyişikliyi funksiyası
  const handleStatusChange = (id, newStatus) => {
    const updatedProduction = production.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    )
    setProduction(updatedProduction)
    localStorage.setItem('officeProduction', JSON.stringify(updatedProduction))
  }

  // Tarix formatlaşdırma funksiyası
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Tarix fərqi hesablama
  const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }



  // İstehsalat düzənləmə
  const handleEditProduction = (item) => {
    // Qiymətləndirmə qeydlərini əldə et
    let pricingNotes = ''
    if (item.pricingId) {
      const pricing = pricingData.find(p => p.id === item.pricingId)
      if (pricing && pricing.pricingNotes) {
        pricingNotes = pricing.pricingNotes
      }
    }
    
    setSelectedProduction(item)
    setNewProduction({
      projectId: item.projectId || '',
      productName: item.productName || '',
      quantity: item.quantity || '',
      unit: item.unit || 'ədəd',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      status: item.status || 'planlaşdırılıb',
      priority: item.priority || 'orta',
      notes: pricingNotes, // Qiymətləndirmə qeydlərini göstər
      assignedWorkers: item.assignedWorkers || [],
      materials: item.materials || [],
      qualityChecks: item.qualityChecks || [],
      pricingId: item.pricingId || null,
      materialDetails: item.materialDetails || []
    })
    setShowEditModal(true)
  }

  // Status rəngini al
  const getStatusColor = (status) => {
    switch (status) {
      case 'planlaşdırılıb': return '#ffc107'
      case 'istehsalda': return '#007bff'
      case 'tamamlandı': return '#28a745'
      case 'dayandırılıb': return '#dc3545'
      default: return '#6c757d'
    }
  }

  // Priority rəngini al
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'aşağı': return '#28a745'
      case 'orta': return '#ffc107'
      case 'yüksək': return '#dc3545'
      default: return '#6c757d'
    }
  }

  // PDF görüntüleme modalını aç
  const handleViewPdf = (projectPdf) => {
    setSelectedProduction({ projectPdf })
    setShowPdfModal(true)
  }

  // Material detalları üçün funksiyalar
  const addMaterialDetail = () => {
    const newDetail = {
      id: Date.now() + Math.random(),
      materialName: '',
      materialType: '',
      size: '',
      quantity: '',
      count: '',
      unit: 'ədəd',
      completed: false
    }
    setNewProduction(prev => ({
      ...prev,
      materialDetails: [...prev.materialDetails, newDetail]
    }))
  }

  const removeMaterialDetail = (id) => {
    setNewProduction(prev => ({
      ...prev,
      materialDetails: prev.materialDetails.filter(detail => detail.id !== id)
    }))
  }

  const updateMaterialDetail = (id, field, value) => {
    setNewProduction(prev => ({
      ...prev,
      materialDetails: prev.materialDetails.map(detail =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    }))
  }


  // Material növləri
  const materialTypes = [
    'Dirək',
    'Travers', 
    'Tava',
    'Baryer',
    'Zəlzələ Çarpazı',
    'Çarpaz',
    'Bolt',
    'Qaynaq',
    'Boyar maddə',
    'Digər'
  ]


  // İstehsal statistikaları hesablama
  const getProductionStats = () => {
    const total = production.length
    const planned = production.filter(p => p.status === 'planlaşdırılıb').length
    const inProgress = production.filter(p => p.status === 'istehsalda').length
    const completed = production.filter(p => p.status === 'tamamlandı').length
    const paused = production.filter(p => p.status === 'dayandırılıb').length
    
    // Gecikmiş sifarişlər
    const overdue = production.filter(p => {
      if (p.status === 'tamamlandı') return false
      const pricing = pricingData.find(pr => pr.id === p.pricingId)
      const endDate = pricing?.productionEndDate || p.endDate
      if (!endDate) return false
      return new Date(endDate) < new Date()
    }).length
    
    return { total, planned, inProgress, completed, paused, overdue }
  }

  const stats = getProductionStats()

  return (
    <div>

      <div className="production-section" style={{
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        margin: '20px',
        overflow: 'hidden'
      }}>
        <div className="production-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '25px 30px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{
            color: '#333',
            fontSize: '1.4rem',
            fontWeight: '600',
            margin: 0
          }}>İstehsalat Sifarişləri</h3>
        </div>

        {/* Search Bar */}
        <div style={{ 
          padding: '25px 30px', 
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '15px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#6c757d' 
            }} />
            <input
              type="text"
              placeholder="İstehsalat axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 15px 15px 45px',
                border: '1px solid #dee2e6',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.backgroundColor = '#ffffff'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dee2e6'
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="production-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            minWidth: '1000px'
          }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ 
                padding: '15px 12px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: '#333',
                borderBottom: '2px solid #dee2e6',
                minWidth: '180px'
              }}>Müştəri Adı</th>
                             <th style={{ 
                 padding: '15px 12px', 
                 textAlign: 'left', 
                 fontWeight: '600', 
                 color: '#333',
                 borderBottom: '2px solid #dee2e6',
                 minWidth: '100px'
               }}>Miqdar</th>
               <th style={{ 
                 padding: '15px 12px', 
                 textAlign: 'left', 
                 fontWeight: '600', 
                 color: '#333',
                 borderBottom: '2px solid #dee2e6',
                 minWidth: '120px'
               }}>PDF Faylı</th>
              
              <th style={{ 
                padding: '15px 12px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: '#333',
                borderBottom: '2px solid #dee2e6',
                minWidth: '130px'
              }}>İstehsalat Başlama Tarixi</th>
              <th style={{ 
                padding: '15px 12px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: '#333',
                borderBottom: '2px solid #dee2e6',
                minWidth: '130px'
              }}>İstehsalat Bitmə Tarixi</th>
              <th style={{ 
                padding: '15px 12px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: '#333',
                borderBottom: '2px solid #dee2e6',
                minWidth: '120px'
              }}>Vəziyyət</th>
              <th style={{ 
                padding: '15px 12px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: '#333',
                borderBottom: '2px solid #dee2e6',
                minWidth: '100px'
              }}>Prioritet</th>
              <th style={{ 
                padding: '15px 12px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: '#333',
                borderBottom: '2px solid #dee2e6',
                minWidth: '120px'
              }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduction.map((item, index) => (
              <tr key={item.id} style={{ 
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                borderBottom: '1px solid #e9ecef'
              }}>
                <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Package size={16} style={{ marginRight: '10px', color: '#667eea' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                        ID: {item.id}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduction(item)
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
                                 <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     <span style={{ 
                       fontWeight: '600', 
                       color: '#495057',
                       fontSize: '0.9rem'
                     }}>
                       {item.quantity} {item.unit}
                     </span>
                   </div>
                 </td>
                                   <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileText size={14} style={{ marginRight: '6px', color: '#666' }} />
                      <span style={{ fontSize: '0.8rem' }}>
                        {(() => {
                          // Qiymətləndirmə ID-sindən layihəni tap
                          const pricing = pricingData.find(p => p.id === item.pricingId)
                          console.log('Item pricingId:', item.pricingId)
                          console.log('Found pricing:', pricing)
                          
                          if (pricing) {
                            // Layihəni tap - pricing.projectId istifadə et
                            const project = projectsData.find(proj => proj.id === pricing.projectId)
                            console.log('Pricing projectId:', pricing.projectId)
                            console.log('Found project:', project)
                            console.log('Project PDF:', project?.projectPdf)
                            
                            return project?.projectPdf ? 'PDF mövcuddur' : 'PDF yoxdur'
                          }
                          return 'PDF yoxdur'
                        })()}
                      </span>
                      {(() => {
                        const pricing = pricingData.find(p => p.id === item.pricingId)
                        if (pricing) {
                          const project = projectsData.find(proj => proj.id === pricing.projectId)
                          if (project?.projectPdf) {
                            return (
                              <button
                                onClick={() => handleViewPdf(project.projectPdf)}
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
                            )
                          }
                        }
                        return null
                      })()}
                    </div>
                  </td>
                
                <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Calendar size={16} style={{ marginRight: '8px', color: '#6c757d' }} />
                    <div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#495057',
                        fontWeight: '500'
                      }}>
                        {(() => {
                          const pricing = pricingData.find(p => p.id === item.pricingId)
                          const startDate = pricing?.productionStartDate || item.startDate
                          return formatDate(startDate)
                        })()}
                      </div>
                      {(() => {
                        const pricing = pricingData.find(p => p.id === item.pricingId)
                        const startDate = pricing?.productionStartDate || item.startDate
                        const endDate = pricing?.productionEndDate || item.endDate
                        const days = calculateDaysDifference(startDate, endDate)
                        return days ? (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#6c757d',
                            fontStyle: 'italic'
                          }}>
                            {days} gün
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Clock size={16} style={{ marginRight: '8px', color: '#6c757d' }} />
                    <div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#495057',
                        fontWeight: '500'
                      }}>
                        {(() => {
                          const pricing = pricingData.find(p => p.id === item.pricingId)
                          const endDate = pricing?.productionEndDate || item.endDate
                          return formatDate(endDate)
                        })()}
                      </div>
                      {(() => {
                        const pricing = pricingData.find(p => p.id === item.pricingId)
                        const endDate = pricing?.productionEndDate || item.endDate
                        if (endDate) {
                          const today = new Date()
                          const end = new Date(endDate)
                          const isOverdue = end < today && item.status !== 'tamamlandı'
                          return (
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: isOverdue ? '#dc3545' : '#6c757d',
                              fontStyle: 'italic',
                              fontWeight: isOverdue ? '600' : 'normal'
                            }}>
                              {isOverdue ? 'Gecikmiş' : 'Gözlənilir'}
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                  <span 
                    className="status-badge"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(item.status) + '15',
                      color: getStatusColor(item.status),
                      border: `1px solid ${getStatusColor(item.status)}30`,
                      display: 'inline-block',
                      textAlign: 'center',
                      minWidth: '80px'
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                  <span 
                    className="priority-badge"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: getPriorityColor(item.priority) + '15',
                      color: getPriorityColor(item.priority),
                      border: `1px solid ${getPriorityColor(item.priority)}30`,
                      display: 'inline-block',
                      textAlign: 'center',
                      minWidth: '60px'
                    }}
                  >
                    {item.priority}
                  </span>
                </td>
                                 <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                     {item.status === 'tamamlandı' ? (
                       <span style={{ 
                         color: '#28a745', 
                         fontSize: '0.8rem',
                         fontWeight: '600',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '4px'
                       }}>
                         <CheckCircle size={14} />
                         Tamamlandı
                       </span>
                     ) : (
                       <>
                         <button 
                           onClick={() => handleEditProduction(item)}
                           style={{
                             background: '#007bff',
                             color: 'white',
                             border: 'none',
                             padding: '6px 10px',
                             borderRadius: '4px',
                             cursor: 'pointer',
                             fontSize: '0.7rem',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '4px',
                             transition: 'all 0.2s ease'
                           }}
                           onMouseOver={(e) => e.target.style.background = '#0056b3'}
                           onMouseOut={(e) => e.target.style.background = '#007bff'}
                         >
                           <Edit size={12} />
                           Düzənlə
                         </button>
                         
                         {item.status === 'planlaşdırılıb' && (
                           <button 
                             onClick={() => handleStatusChange(item.id, 'istehsalda')}
                             style={{
                               background: '#28a745',
                               color: 'white',
                               border: 'none',
                               padding: '6px 10px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '4px',
                               transition: 'all 0.2s ease'
                             }}
                             onMouseOver={(e) => e.target.style.background = '#218838'}
                             onMouseOut={(e) => e.target.style.background = '#28a745'}
                           >
                             <Factory size={12} />
                             Başlat
                           </button>
                         )}
                         
                         {item.status === 'istehsalda' && (
                           <button 
                             onClick={() => handleStatusChange(item.id, 'tamamlandı')}
                             style={{
                               background: '#28a745',
                               color: 'white',
                               border: 'none',
                               padding: '6px 10px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '4px',
                               transition: 'all 0.2s ease'
                             }}
                             onMouseOver={(e) => e.target.style.background = '#218838'}
                             onMouseOut={(e) => e.target.style.background = '#28a745'}
                           >
                             <CheckCircle size={12} />
                             Tamamla
                           </button>
                         )}
                         
                         {item.status !== 'tamamlandı' && (
                           <button 
                             onClick={() => handleStatusChange(item.id, 'dayandırılıb')}
                             style={{
                               background: '#dc3545',
                               color: 'white',
                               border: 'none',
                               padding: '6px 10px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontSize: '0.7rem',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '4px',
                               transition: 'all 0.2s ease'
                             }}
                             onMouseOver={(e) => e.target.style.background = '#c82333'}
                             onMouseOut={(e) => e.target.style.background = '#dc3545'}
                           >
                             <AlertCircle size={12} />
                             Dayandır
                           </button>
                         )}
                       </>
                     )}
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filteredProduction.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 30px', 
            color: '#6c757d',
            fontSize: '1.1rem',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e9ecef'
          }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '15px',
              color: '#dee2e6'
            }}>
              📋
            </div>
            <div style={{ fontWeight: '500', marginBottom: '8px' }}>
              İstehsalat sifarişi tapılmadı
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              Axtarış kriterlərinə uyğun istehsalat sifarişi mövcud deyil.
            </div>
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
              {stats.total}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi Sifariş</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.planned}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Planlaşdırılıb</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {stats.inProgress}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>İstehsalda</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {stats.completed}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Tamamlandı</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {stats.paused}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Dayandırılıb</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stats.overdue > 0 ? '#dc3545' : '#6c757d' }}>
              {stats.overdue}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Gecikmiş</div>
          </div>
        </div>
      </div>

      {/* Add Production Modal */}
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Yeni İstehsalat Sifarişi</h2>
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

            {/* Məhsul Adı */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Müştəri Adı *
              </label>
              <input
                type="text"
                value={newProduction.productName}
                onChange={(e) => setNewProduction(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Məhsul adını daxil edin"
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

            {/* Miqdar */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Miqdar *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={newProduction.quantity}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, quantity: e.target.value }))}
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
                  value={newProduction.unit}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, unit: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="ədəd">ədəd</option>
                  <option value="kq">kq</option>
                  <option value="ton">ton</option>
                  <option value="metr">metr</option>
                  <option value="litr">litr</option>
                </select>
              </div>
            </div>

            {/* Tarixlər */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Başlama Tarixi
                </label>
                <input
                  type="date"
                  value={newProduction.startDate}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, startDate: e.target.value }))}
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
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Bitmə Tarixi
                </label>
                <input
                  type="date"
                  value={newProduction.endDate}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, endDate: e.target.value }))}
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

            {/* Vəziyyət və Prioritet */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Vəziyyət
                </label>
                <select
                  value={newProduction.status}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, status: e.target.value }))}
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
                  <option value="planlaşdırılıb">Planlaşdırılıb</option>
                  <option value="istehsalda">İstehsalda</option>
                  <option value="tamamlandı">Tamamlandı</option>
                  <option value="dayandırılıb">Dayandırılıb</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Prioritet
                </label>
                <select
                  value={newProduction.priority}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, priority: e.target.value }))}
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
                  <option value="aşağı">Aşağı</option>
                  <option value="orta">Orta</option>
                  <option value="yüksək">Yüksək</option>
                </select>
              </div>
            </div>

            {/* Qeydlər */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qeydlər
              </label>
              <textarea
                value={newProduction.notes}
                onChange={(e) => setNewProduction(prev => ({ ...prev, notes: e.target.value }))}
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
                placeholder="İstehsalat haqqında qeydlər"
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
                onClick={handleAddProduction}
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
                Sifariş Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Production Modal */}
      {showEditModal && selectedProduction && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowEditModal(false)}
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
              width: '95%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>İstehsalat Sifarişini Düzənlə</h2>
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

            {/* Məhsul Adı */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Müştəri Adı *
              </label>
              <input
                type="text"
                value={newProduction.productName}
                onChange={(e) => setNewProduction(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Məhsul adını daxil edin"
                disabled={newProduction.pricingId !== null}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: newProduction.pricingId !== null ? '#f5f5f5' : 'white',
                  color: newProduction.pricingId !== null ? '#666' : '#333',
                  cursor: newProduction.pricingId !== null ? 'not-allowed' : 'text'
                }}
              />
              {newProduction.pricingId !== null && (
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  ⚠️ Qiymətləndirmədən gələn müştəri adı dəyişdirilə bilməz
                </div>
              )}
            </div>

            {/* Miqdar */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Miqdar *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={newProduction.quantity}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  disabled={newProduction.pricingId !== null}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: newProduction.pricingId !== null ? '#f5f5f5' : 'white',
                    color: newProduction.pricingId !== null ? '#666' : '#333',
                    cursor: newProduction.pricingId !== null ? 'not-allowed' : 'text'
                  }}
                />
                <select
                  value={newProduction.unit}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, unit: e.target.value }))}
                  disabled={newProduction.pricingId !== null}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: newProduction.pricingId !== null ? '#f5f5f5' : 'white',
                    color: newProduction.pricingId !== null ? '#666' : '#333',
                    cursor: newProduction.pricingId !== null ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="ədəd">ədəd</option>
                  <option value="kq">kq</option>
                  <option value="ton">ton</option>
                  <option value="metr">metr</option>
                  <option value="litr">litr</option>
                </select>
              </div>
              {newProduction.pricingId !== null && (
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  ⚠️ Qiymətləndirmədən gələn miqdar dəyişdirilə bilməz
                </div>
              )}
            </div>

            {/* Tarixlər */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Başlama Tarixi
                </label>
                <input
                  type="date"
                  value={newProduction.startDate}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, startDate: e.target.value }))}
                  disabled={newProduction.pricingId !== null}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: newProduction.pricingId !== null ? '#f5f5f5' : 'white',
                    color: newProduction.pricingId !== null ? '#666' : '#333',
                    cursor: newProduction.pricingId !== null ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Bitmə Tarixi
                </label>
                <input
                  type="date"
                  value={newProduction.endDate}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={newProduction.pricingId !== null}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: newProduction.pricingId !== null ? '#f5f5f5' : 'white',
                    color: newProduction.pricingId !== null ? '#666' : '#333',
                    cursor: newProduction.pricingId !== null ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>
            {newProduction.pricingId !== null && (
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>
                ⚠️ Qiymətləndirmədən gələn tarixlər dəyişdirilə bilməz
              </div>
            )}

            {/* Status və Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={newProduction.status}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, status: e.target.value }))}
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
                  <option value="planlaşdırılıb">Planlaşdırılıb</option>
                  <option value="istehsalda">İstehsalda</option>
                  <option value="tamamlandı">Tamamlandı</option>
                  <option value="dayandırılıb">Dayandırılıb</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                  Prioritet
                </label>
                <select
                  value={newProduction.priority}
                  onChange={(e) => setNewProduction(prev => ({ ...prev, priority: e.target.value }))}
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
                  <option value="aşağı">Aşağı</option>
                  <option value="orta">Orta</option>
                  <option value="yüksək">Yüksək</option>
                </select>
              </div>
            </div>

            {/* Qeydlər */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
                Qiymətləndirmə Qeydləri
              </label>
              <textarea
                value={newProduction.notes}
                onChange={(e) => setNewProduction(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="İstehsalat haqqında qeydlər"
                readOnly={true} // Qeydləri oxunaqlı amma dəyişdirilə bilməz et
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px',
                  backgroundColor: '#f8f9fa', // Oxunaqlı olduğunu göstərmək üçün arxa fon rəngi
                  color: '#495057',
                  cursor: 'not-allowed' // Dəyişdirilə bilmədiyini göstərmək üçün kursor
                }}
              />
            </div>

            {/* Material Detalları */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <label style={{ color: '#333', fontWeight: '500', fontSize: '16px' }}>
                    İstifadə Ediləcək Material Detalları
                  </label>
                </div>
                <button
                  onClick={addMaterialDetail}
                  style={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <Plus size={16} />
                  Material Əlavə Et
                </button>
              </div>

              {newProduction.materialDetails.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  color: '#6c757d'
                }}>
                  <Package size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <div style={{ fontSize: '14px' }}>
                    Hələ material əlavə edilməyib
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {newProduction.materialDetails.map((detail, index) => (
                    <div key={detail.id} style={{
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '10px',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                            Material #{index + 1}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => removeMaterialDetail(detail.id)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#c82333'}
                            onMouseOut={(e) => e.target.style.background = '#dc3545'}
                          >
                            <X size={12} />
                            Sil
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '12px', fontWeight: '500' }}>
                            Materialın Adı *
                          </label>
                          <select
                            value={detail.materialName || ''}
                            onChange={(e) => updateMaterialDetail(detail.id, 'materialName', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px',
                              outline: 'none',
                              background: 'white'
                            }}
                          >
                            <option value="">Material adını seçin</option>
                            {materialTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '12px', fontWeight: '500' }}>
                            Növ *
                          </label>
                          <input
                            type="text"
                            value={detail.materialType || ''}
                            onChange={(e) => updateMaterialDetail(detail.id, 'materialType', e.target.value)}
                            placeholder="Məs: 100x50"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '12px', fontWeight: '500' }}>
                            Ölçü *
                          </label>
                          <input
                            type="text"
                            value={detail.size}
                            onChange={(e) => updateMaterialDetail(detail.id, 'size', e.target.value)}
                            placeholder="Məs: 2700mm"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '12px', fontWeight: '500' }}>
                            Say *
                          </label>
                          <input
                            type="number"
                            value={detail.count}
                            onChange={(e) => updateMaterialDetail(detail.id, 'count', e.target.value)}
                            placeholder="0"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontSize: '12px', fontWeight: '500' }}>
                            Vahid *
                          </label>
                          <select
                            value={detail.unit || 'ədəd'}
                            onChange={(e) => updateMaterialDetail(detail.id, 'unit', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px',
                              outline: 'none',
                              background: 'white'
                            }}
                          >
                            <option value="ədəd">ədəd</option>
                            <option value="sm">sm</option>
                            <option value="m">m</option>
                            <option value="kq">kq</option>
                            <option value="ton">ton</option>
                            <option value="litr">litr</option>
                            <option value="m²">m²</option>
                            <option value="m³">m³</option>
                            <option value="mm">mm</option>
                            <option value="dm">dm</option>
                          </select>
                        </div>
                      </div>


                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Butonlar */}
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
                onClick={handleUpdateProduction}
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
      {showInfoModal && selectedProduction && (
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
              <h2 style={{ color: '#333', margin: 0 }}>İstehsalat Məlumatları</h2>
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
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Məhsul Məlumatları</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Məhsul Adı:</strong> {selectedProduction.productName}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>İstehsalat ID:</strong> {selectedProduction.id}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Miqdar:</strong> {selectedProduction.quantity} {selectedProduction.unit}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: selectedProduction.status === 'planlaşdırılıb' ? '#fff3cd' : 
                                   selectedProduction.status === 'istehsalda' ? '#d1ecf1' :
                                   selectedProduction.status === 'tamamlandı' ? '#d4edda' : '#f8d7da',
                        color: selectedProduction.status === 'planlaşdırılıb' ? '#856404' : 
                               selectedProduction.status === 'istehsalda' ? '#0c5460' :
                               selectedProduction.status === 'tamamlandı' ? '#155724' : '#721c24'
                      }}>
                        {selectedProduction.status === 'planlaşdırılıb' ? 'Planlaşdırılıb' : 
                         selectedProduction.status === 'istehsalda' ? 'İstehsalda' :
                         selectedProduction.status === 'tamamlandı' ? 'Tamamlandı' : 'Dayandırılıb'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Tarix Məlumatları</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Başlama Tarixi:</strong> {selectedProduction.startDate || 'Məlumat yoxdur'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Bitmə Tarixi:</strong> {selectedProduction.endDate || 'Məlumat yoxdur'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Yaradılma Tarixi:</strong> {selectedProduction.createdAt || 'Məlumat yoxdur'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ tərəf */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Əlavə Məlumatlar</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Prioritet:</strong> 
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: selectedProduction.priority === 'aşağı' ? '#d4edda' : 
                                   selectedProduction.priority === 'orta' ? '#fff3cd' : '#f8d7da',
                        color: selectedProduction.priority === 'aşağı' ? '#155724' : 
                               selectedProduction.priority === 'orta' ? '#856404' : '#721c24'
                      }}>
                        {selectedProduction.priority === 'aşağı' ? 'Aşağı' : 
                         selectedProduction.priority === 'orta' ? 'Orta' : 'Yüksək'}
                      </span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Layihə ID:</strong> {selectedProduction.projectId || 'Məlumat yoxdur'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Qiymətləndirmə ID:</strong> {selectedProduction.pricingId || 'Məlumat yoxdur'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Qeydlər</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>İstehsalat Qeydləri:</strong> {selectedProduction.notes || 'Qeyd yoxdur'}
                    </div>
                  </div>
                </div>

                {/* Material Detalları */}
                {selectedProduction.materialDetails && selectedProduction.materialDetails.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Material Detalları</h3>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      {selectedProduction.materialDetails.map((detail, index) => (
                        <div key={detail.id} style={{
                          background: 'white',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          padding: '10px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                            Material #{index + 1}: {detail.materialName || detail.materialType || 'Ad yoxdur'}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            <div><strong>Növ:</strong> {detail.materialType || 'Məlumat yoxdur'}</div>
                            <div><strong>Ölçüsü:</strong> {detail.size || 'Məlumat yoxdur'}</div>
                            <div><strong>Say:</strong> {detail.count || 'Məlumat yoxdur'}</div>
                            <div><strong>Vahid:</strong> {detail.unit || 'Məlumat yoxdur'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* PDF Viewer Modal */}
      {showPdfModal && selectedProduction && selectedProduction.projectPdf && (
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
                 Layihə PDF Faylı
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
                 src={selectedProduction.projectPdf}
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
                 href={selectedProduction.projectPdf}
                 download="layihe_dosyasi.pdf"
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

export default ProductionPage

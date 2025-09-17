import React, { useState } from 'react'
import { Search, Eye, CheckCircle, Clock, AlertCircle, Package, Factory, Users, BarChart3, Info } from 'lucide-react'

function FactoryPage() {
  // localStorage-dan fabrik verilərini yüklə
  const getInitialFactory = () => {
    const savedFactory = localStorage.getItem('officeFactory')
    if (savedFactory) {
      return JSON.parse(savedFactory)
    }
    return []
  }

  // localStorage-dan istehsalat verilərini al
  const getProductionData = () => {
    const savedProduction = localStorage.getItem('officeProduction')
    if (savedProduction) {
      return JSON.parse(savedProduction)
    }
    return []
  }

  const [factory, setFactory] = useState(getInitialFactory)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedFactory, setSelectedFactory] = useState(null)

  // İstehsalat verilərini al
  const productionData = getProductionData()

  // İstehsalatda olan sifarişləri fabrikə əlavə et
  React.useEffect(() => {
    const istehsaldaOlanSifarisler = productionData.filter(item => item.status === 'istehsalda')
    
    // Fabrikdə olmayan sifarişləri əlavə et
    const yeniSifarisler = istehsaldaOlanSifarisler.filter(prod => 
      !factory.some(f => f.productionId === prod.id)
    )

    if (yeniSifarisler.length > 0) {
      const yeniFabrikSifarisleri = yeniSifarisler.map(prod => ({
        id: Date.now() + Math.random(),
        productionId: prod.id,
        productName: prod.productName,
        quantity: prod.quantity,
        unit: prod.unit,
        startDate: prod.startDate,
        endDate: prod.endDate,
        priority: prod.priority,
        notes: prod.notes,
        materialDetails: prod.materialDetails || [],
        status: 'fabrikdə', // fabrikdə, tamamlandı, dayandırılıb
        createdAt: new Date().toISOString().split('T')[0],
        assignedWorkers: [],
        progress: 0
      }))

      const updatedFactory = [...factory, ...yeniFabrikSifarisleri]
      setFactory(updatedFactory)
      localStorage.setItem('officeFactory', JSON.stringify(updatedFactory))
    }
  }, [productionData, factory])

  // Fabrik sifarişlərini filtrele
  const filteredFactory = factory.filter(item => {
    return (
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.priority.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Status rəngini al
  const getStatusColor = (status) => {
    switch (status) {
      case 'fabrikdə': return '#007bff'
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

  // Sifariş statusunu yenilə
  const updateOrderStatus = (id, newStatus) => {
    const updatedFactory = factory.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    )
    setFactory(updatedFactory)
    localStorage.setItem('officeFactory', JSON.stringify(updatedFactory))

    // Əgər tamamlandısa, istehsalat statusunu da yenilə
    if (newStatus === 'tamamlandı') {
      const updatedProduction = productionData.map(item => 
        item.id === factory.find(f => f.id === id)?.productionId ? { ...item, status: 'tamamlandı' } : item
      )
      localStorage.setItem('officeProduction', JSON.stringify(updatedProduction))
    }
  }

  // Material tamamlandı funksiyası
  const completeMaterial = (factoryId, materialId) => {
    const updatedFactory = factory.map(item => {
      if (item.id === factoryId) {
        const updatedMaterialDetails = item.materialDetails.map(material => {
          if (material.id === materialId) {
            return { ...material, completed: true }
          }
          return material
        })
        
        // Progress hesabla
        const completedMaterials = updatedMaterialDetails.filter(m => m.completed).length
        const totalMaterials = updatedMaterialDetails.length
        const progress = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0
        
        const updatedItem = {
          ...item,
          materialDetails: updatedMaterialDetails,
          progress: progress
        }
        
        // Əgər bu modal-da açıq olan sifarişdirsə, selectedFactory-ni də yenilə
        if (selectedFactory && selectedFactory.id === factoryId) {
          setSelectedFactory(updatedItem)
        }
        
        return updatedItem
      }
      return item
    })
    
    setFactory(updatedFactory)
    localStorage.setItem('officeFactory', JSON.stringify(updatedFactory))
  }

  // Material progress hesablama
  const calculateMaterialProgress = (materialDetails) => {
    if (!materialDetails || materialDetails.length === 0) return 0
    const completed = materialDetails.filter(m => m.completed).length
    return Math.round((completed / materialDetails.length) * 100)
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

  return (
    <div>
      <div className="factory-section" style={{
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        margin: '20px',
        overflow: 'hidden'
      }}>
        <div className="factory-header" style={{
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
          }}>Fabrik Sifarişləri</h3>
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
              placeholder="Fabrik sifarişi axtar..."
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
          <table className="factory-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            minWidth: '1200px'
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
              }}>Məhsul Adı</th>
                             <th style={{ 
                 padding: '15px 12px', 
                 textAlign: 'left', 
                 fontWeight: '600', 
                 color: '#333',
                 borderBottom: '2px solid #dee2e6',
                 minWidth: '130px'
               }}>Başlama Tarixi</th>
               <th style={{ 
                 padding: '15px 12px', 
                 textAlign: 'left', 
                 fontWeight: '600', 
                 color: '#333',
                 borderBottom: '2px solid #dee2e6',
                 minWidth: '130px'
               }}>Bitmə Tarixi</th>
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
               }}>Material Progress</th>
               <th style={{ 
                 padding: '15px 12px', 
                 textAlign: 'left', 
                 fontWeight: '600', 
                 color: '#333',
                 borderBottom: '2px solid #dee2e6',
                 minWidth: '120px'
               }}>Əməliyyatlar</th>
               <th style={{ 
                 padding: '15px 12px', 
                 textAlign: 'left', 
                 fontWeight: '600', 
                 color: '#333',
                 borderBottom: '2px solid #dee2e6',
                 minWidth: '120px'
               }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactory.map((item, index) => (
              <tr key={item.id} style={{ 
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                borderBottom: '1px solid #e9ecef'
              }}>
                <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Factory size={16} style={{ marginRight: '10px', color: '#667eea' }} />
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
                        setSelectedFactory(item)
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
                     <Clock size={16} style={{ marginRight: '8px', color: '#6c757d' }} />
                     <div>
                       <div style={{ 
                         fontSize: '0.85rem', 
                         color: '#495057',
                         fontWeight: '500'
                       }}>
                         {formatDate(item.startDate)}
                       </div>
                       {(() => {
                         const days = calculateDaysDifference(item.startDate, item.endDate)
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
                         {formatDate(item.endDate)}
                       </div>
                       {(() => {
                         if (item.endDate) {
                           const today = new Date()
                           const end = new Date(item.endDate)
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      background: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: calculateMaterialProgress(item.materialDetails) === 100 ? '#28a745' : '#007bff',
                        width: `${calculateMaterialProgress(item.materialDetails)}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: calculateMaterialProgress(item.materialDetails) === 100 ? '#28a745' : '#007bff',
                      minWidth: '35px'
                    }}>
                      {calculateMaterialProgress(item.materialDetails)}%
                    </span>
                  </div>
                </td>
                 <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', gap: '6px' }}>
                     {item.status === 'tamamlandı' ? (
                       <span style={{ 
                         color: '#999', 
                         fontSize: '0.8rem',
                         fontStyle: 'italic',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '4px'
                       }}>
                         <CheckCircle size={14} />
                         Tamamlandı
                       </span>
                     ) : (
                       <div style={{ display: 'flex', gap: '4px' }}>
                         <button 
                           onClick={() => updateOrderStatus(item.id, 'tamamlandı')}
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
                         <button 
                           onClick={() => updateOrderStatus(item.id, 'dayandırılıb')}
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
                       </div>
                     )}
                   </div>
                 </td>
                 <td style={{ padding: '15px 12px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{
                       flex: 1,
                       height: '8px',
                       background: '#e9ecef',
                       borderRadius: '4px',
                       overflow: 'hidden'
                     }}>
                       <div style={{
                         height: '100%',
                         background: item.progress === 100 ? '#28a745' : '#007bff',
                         width: `${item.progress || 0}%`,
                         transition: 'width 0.3s ease'
                       }} />
                     </div>
                     <span style={{
                       fontSize: '0.8rem',
                       fontWeight: '600',
                       color: item.progress === 100 ? '#28a745' : '#007bff',
                       minWidth: '35px'
                     }}>
                       {item.progress || 0}%
                     </span>
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filteredFactory.length === 0 && (
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
              🏭
            </div>
            <div style={{ fontWeight: '500', marginBottom: '8px' }}>
              Fabrik sifarişi tapılmadı
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              İstehsal planlamasında "istehsalda" statuslu sifarişlər burada görünəcək.
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
              {factory.length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Ümumi Sifariş</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {factory.filter(f => f.status === 'fabrikdə').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Fabrikdə</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {factory.filter(f => f.status === 'tamamlandı').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Tamamlandı</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {factory.filter(f => f.status === 'dayandırılıb').length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Dayandırılıb</div>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && selectedFactory && (
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
              <h2 style={{ color: '#333', margin: 0 }}>Fabrik Sifariş Məlumatları</h2>
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
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Sol tərəf */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Məhsul Məlumatları</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Məhsul Adı:</strong> {selectedFactory.productName}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Fabrik ID:</strong> {selectedFactory.id}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Miqdar:</strong> {selectedFactory.quantity} {selectedFactory.unit}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: selectedFactory.status === 'fabrikdə' ? '#d1ecf1' :
                                   selectedFactory.status === 'tamamlandı' ? '#d4edda' : '#f8d7da',
                        color: selectedFactory.status === 'fabrikdə' ? '#0c5460' :
                               selectedFactory.status === 'tamamlandı' ? '#155724' : '#721c24'
                      }}>
                        {selectedFactory.status === 'fabrikdə' ? 'Fabrikdə' : 
                         selectedFactory.status === 'tamamlandı' ? 'Tamamlandı' : 'Dayandırılıb'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Tarix Məlumatları</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Başlama Tarixi:</strong> {selectedFactory.startDate || 'Məlumat yoxdur'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Bitmə Tarixi:</strong> {selectedFactory.endDate || 'Məlumat yoxdur'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Yaradılma Tarixi:</strong> {selectedFactory.createdAt || 'Məlumat yoxdur'}
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
                        background: selectedFactory.priority === 'aşağı' ? '#d4edda' : 
                                   selectedFactory.priority === 'orta' ? '#fff3cd' : '#f8d7da',
                        color: selectedFactory.priority === 'aşağı' ? '#155724' : 
                               selectedFactory.priority === 'orta' ? '#856404' : '#721c24'
                      }}>
                        {selectedFactory.priority === 'aşağı' ? 'Aşağı' : 
                         selectedFactory.priority === 'orta' ? 'Orta' : 'Yüksək'}
                      </span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>İstehsalat ID:</strong> {selectedFactory.productionId || 'Məlumat yoxdur'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Qeydlər</h3>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Fabrik Qeydləri:</strong> {selectedFactory.notes || 'Qeyd yoxdur'}
                    </div>
                  </div>
                </div>

                                 {/* Material Detalları */}
                 {selectedFactory.materialDetails && selectedFactory.materialDetails.length > 0 && (
                   <div style={{ marginBottom: '20px' }}>
                     <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Material Detalları</h3>
                     <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                       {selectedFactory.materialDetails.map((detail, index) => (
                         <div key={detail.id} style={{
                           background: 'white',
                           border: '1px solid #e9ecef',
                           borderRadius: '6px',
                           padding: '10px',
                           marginBottom: '8px',
                           opacity: detail.completed ? 0.7 : 1
                         }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                             <div style={{ fontWeight: '600', color: '#333' }}>
                               Material #{index + 1}: {detail.materialName || detail.materialType || 'Ad yoxdur'}
                             </div>
                             {detail.completed ? (
                               <span style={{
                                 background: '#28a745',
                                 color: 'white',
                                 padding: '2px 8px',
                                 borderRadius: '12px',
                                 fontSize: '0.7rem',
                                 fontWeight: '500'
                               }}>
                                 Tamamlandı
                               </span>
                             ) : (
                               <button
                                 onClick={() => completeMaterial(selectedFactory.id, detail.id)}
                                 style={{
                                   background: '#007bff',
                                   color: 'white',
                                   border: 'none',
                                   padding: '4px 8px',
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
                                 <CheckCircle size={10} />
                                 Tamamla
                               </button>
                             )}
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
    </div>
  )
}

export default FactoryPage

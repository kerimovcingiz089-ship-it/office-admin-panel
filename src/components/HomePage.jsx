import React, { useState } from 'react'
import { Users, FileText, Calendar, TrendingUp, Phone, Clock, Target, FolderOpen, Factory, Award } from 'lucide-react'

function HomePage() {
  // localStorage'dan kullanıcı verilerini al
  const getUsers = () => {
    const savedUsers = localStorage.getItem('officeUsers')
    if (savedUsers) {
      return JSON.parse(savedUsers)
    }
    return []
  }

  const users = getUsers()
  const activeUsers = users.filter(user => user.status === 'active').length
  const totalUsers = users.length

  // Sorğu verilerini al
  const getInquiries = () => {
    const savedInquiries = localStorage.getItem('officeInquiries')
    if (savedInquiries) {
      return JSON.parse(savedInquiries)
    }
    return []
  }

  const inquiries = getInquiries()
  const activeInquiries = inquiries.filter(inquiry => inquiry.status === 'active').length
  const plannedInquiries = inquiries.filter(inquiry => inquiry.status === 'planned').length
  const completedInquiries = inquiries.filter(inquiry => inquiry.status === 'completed').length
  const totalInquiries = inquiries.length
  
  // Yeni dinamik veri hesaplamaları
  const designInquiries = inquiries.filter(inquiry => inquiry.status === 'design' || inquiry.status === 'in_design').length
  const pricingInquiries = inquiries.filter(inquiry => inquiry.status === 'pricing' || inquiry.status === 'in_pricing').length
  const productionOrders = inquiries.filter(inquiry => inquiry.status === 'production' || inquiry.status === 'in_production').length
  
  // Sürətli statistika üçün əlavə məlumatlar
  const getMeetingsData = () => {
    const savedMeetings = localStorage.getItem('officeMeetings')
    return savedMeetings ? JSON.parse(savedMeetings) : []
  }
  
  const getProductionData = () => {
    const savedProduction = localStorage.getItem('officeProduction')
    return savedProduction ? JSON.parse(savedProduction) : []
  }
  
  const meetings = getMeetingsData()
  const production = getProductionData()
  
  // Vaxt filteri üçün state
  const [timeFilter, setTimeFilter] = useState('all') // all, 1m, 2m, 3m, 6m, 1y
  
  // Vaxt filteri funksiyası
  const getFilteredData = (data, dateField) => {
    if (timeFilter === 'all') return data
    
    const now = new Date()
    let filterDate = new Date()
    
    switch (timeFilter) {
      case '1m':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case '2m':
        filterDate.setMonth(now.getMonth() - 2)
        break
      case '3m':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case '6m':
        filterDate.setMonth(now.getMonth() - 6)
        break
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return data
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.createdAt || item.inquiryDate)
      return itemDate >= filterDate
    })
  }
  
  // Sürətli statistika üçün hesablamalar (filter ilə)
  const filteredInquiries = getFilteredData(inquiries, 'inquiryDate')
  const filteredMeetings = getFilteredData(meetings, 'meetingDate')
  const filteredProduction = getFilteredData(production, 'createdAt')
  
  const totalMeetings = filteredMeetings.length
  const totalProduction = filteredProduction.length
  const completedProduction = filteredProduction.filter(item => item.status === 'tamamlandı').length
  
  // Eğer localStorage'da veri yoksa örnek veriler oluştur
  React.useEffect(() => {
    const savedInquiries = localStorage.getItem('officeInquiries')
    if (!savedInquiries) {
      const sampleInquiries = [
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
          inquiryDate: '2024-01-20',
          status: 'planned',
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
          inquiryDate: '2024-01-10',
          status: 'design',
          notes: 'Layihə dizayn mərhələsində.'
        },
        {
          id: 4,
          firstName: 'Fatma',
          lastName: 'Özkan',
          companyName: 'Özkan Mühəndislik',
          phone: '+994 70 234 56 78',
          address: 'Nərimanov Küçəsi No:321, Bakı/Azərbaycan',
          email: 'fatma.ozkan@ozkanmuhendislik.com',
          inquiryDate: '2024-01-12',
          status: 'pricing',
          notes: 'Qiymətləndirmə mərhələsində.'
        },
        {
          id: 5,
          firstName: 'Həsən',
          lastName: 'Çelik',
          companyName: 'Çelik İstehsalat',
          phone: '+994 51 876 54 32',
          address: 'Yasamal Küçəsi No:654, Bakı/Azərbaycan',
          email: 'hasan.celik@celikistehsalat.com',
          inquiryDate: '2024-01-08',
          status: 'production',
          notes: 'İstehsal mərhələsində.'
        },
        {
          id: 6,
          firstName: 'Zeynəb',
          lastName: 'Arslan',
          companyName: 'Arslan Ticarət',
          phone: '+994 55 111 22 33',
          address: 'Binəqədi Küçəsi No:987, Bakı/Azərbaycan',
          email: 'zeyneb.arslan@arslanticarət.com',
          inquiryDate: '2024-01-05',
          status: 'completed',
          notes: 'Layihə tamamlandı, müştəri məmnun.'
        },
        {
          id: 7,
          firstName: 'Məryəm',
          lastName: 'Şahin',
          companyName: 'Şahin Texnologiya',
          phone: '+994 50 999 88 77',
          address: 'Qarabağlar Küçəsi No:147, Bakı/Azərbaycan',
          email: 'meryem.sahin@sahintexnologiya.com',
          inquiryDate: '2024-01-18',
          status: 'active',
          notes: 'Yeni layihə təklifi.'
        },
        {
          id: 8,
          firstName: 'Əhməd',
          lastName: 'Yıldız',
          companyName: 'Yıldız İnşaat',
          phone: '+994 55 777 66 55',
          address: 'Xətai Küçəsi No:258, Bakı/Azərbaycan',
          email: 'ahmed.yildiz@yildizinsaat.com',
          inquiryDate: '2024-01-14',
          status: 'design',
          notes: 'Dizayn mərhələsində.'
        },
        {
          id: 9,
          firstName: 'Səbinə',
          lastName: 'Kurt',
          companyName: 'Kurt Mühəndislik',
          phone: '+994 70 333 44 55',
          address: 'Səbail Küçəsi No:369, Bakı/Azərbaycan',
          email: 'sabine.kurt@kurtmuhendislik.com',
          inquiryDate: '2024-01-16',
          status: 'pricing',
          notes: 'Qiymətləndirmə mərhələsində.'
        },
        {
          id: 10,
          firstName: 'Rəşad',
          lastName: 'Özkan',
          companyName: 'Özkan İstehsalat',
          phone: '+994 51 555 66 77',
          address: 'Nəsimi Küçəsi No:741, Bakı/Azərbaycan',
          email: 'resad.ozkan@ozkanistehsalat.com',
          inquiryDate: '2024-01-11',
          status: 'production',
          notes: 'İstehsal mərhələsində.'
        }
      ]
      localStorage.setItem('officeInquiries', JSON.stringify(sampleInquiries))
    }
  }, [])
  
  // Inquiry güncellemelerini dinle
  React.useEffect(() => {
    const handleInquiriesUpdated = (event) => {
      // Sayfayı yenile
      window.location.reload()
    }
    
    window.addEventListener('inquiriesUpdated', handleInquiriesUpdated)
    
    return () => {
      window.removeEventListener('inquiriesUpdated', handleInquiriesUpdated)
    }
  }, [])

  return (
    <div style={{ width: '100%', padding: '0' }}>
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
        padding: '0'
      }}>
        {/* Users Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <Users size={28} />
              </div>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#1d4ed8',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                +12% bu ay
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Ümumi İstifadəçi
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{totalUsers}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }} />
              Aktiv işçi sayı: {activeUsers}
            </div>
          </div>
        </div>

        {/* Active Inquiries Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Phone size={28} />
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Aktiv
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Aktiv Sorğular
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{activeInquiries}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} />
              Gözləyən müştəri tələbləri
            </div>
          </div>
        </div>

        {/* Planned Visits Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <Calendar size={28} />
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Planlaşdırılıb
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Planlaşdırılmış Ziyarətlər
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{plannedInquiries}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={14} />
              Ziyarət planlaşdırılan tələblər
            </div>
          </div>
        </div>

        {/* Design Inquiries Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
              }}>
                <FolderOpen size={28} />
              </div>
              <div style={{
                background: 'rgba(236, 72, 153, 0.1)',
                color: '#db2777',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Layihələndirmədə
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Layihələndirmədə olan sorğular
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{designInquiries}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} />
              Dizayn prosesində
            </div>
          </div>
        </div>

        {/* Pricing Inquiries Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
              }}>
                <TrendingUp size={28} />
              </div>
              <div style={{
                background: 'rgba(14, 165, 233, 0.1)',
                color: '#0284c7',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Qiymətləndirmədə
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Qiymətləndirmədə olan sorğular
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{pricingInquiries}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={14} />
              Qiymət hesablanır
            </div>
          </div>
        </div>

        {/* Production Orders Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}>
                <Factory size={28} />
              </div>
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                color: '#9333ea',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                İstehsalatda
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                İstehsalatda olan sifarişlər
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{productionOrders}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Factory size={14} />
              İstehsal prosesində
            </div>
          </div>
        </div>

        {/* Completed Orders Card */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)'
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
            borderRadius: '0 16px 0 100px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                <Award size={28} />
              </div>
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#7c3aed',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Tamamlandı
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Tamamlanmış sifarişlər
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>{completedInquiries}</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={14} />
              Tamamlanan müştəri tələbləri
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>📊 Sürətli Statistika</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Şirkətin ümumi performans göstəriciləri
                {timeFilter !== 'all' && (
                  <span style={{ 
                    marginLeft: '8px', 
                    padding: '4px 8px', 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    color: '#667eea',
                    fontWeight: '500'
                  }}>
                    {timeFilter === '1m' && 'Son 1 ay'}
                    {timeFilter === '2m' && 'Son 2 ay'}
                    {timeFilter === '3m' && 'Son 3 ay'}
                    {timeFilter === '6m' && 'Son 6 ay'}
                    {timeFilter === '1y' && 'Son 1 il'}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Vaxt Filteri */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'all', label: 'Hamısı' },
              { key: '1m', label: '1 Ay' },
              { key: '2m', label: '2 Ay' },
              { key: '3m', label: '3 Ay' },
              { key: '6m', label: '6 Ay' },
              { key: '1y', label: '1 İl' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: timeFilter === filter.key 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: timeFilter === filter.key ? 'white' : '#64748b',
                  borderColor: timeFilter === filter.key ? 'transparent' : '#e2e8f0'
                }}
                onMouseEnter={(e) => {
                  if (timeFilter !== filter.key) {
                    e.target.style.background = '#f8fafc'
                    e.target.style.borderColor = '#cbd5e1'
                  }
                }}
                onMouseLeave={(e) => {
                  if (timeFilter !== filter.key) {
                    e.target.style.background = 'transparent'
                    e.target.style.borderColor = '#e2e8f0'
                  }
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '0 16px 0 60px'
            }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#667eea', marginBottom: '8px' }}>{totalInquiries}</div>
              <div style={{ color: '#475569', fontSize: '1rem', fontWeight: '600' }}>Ümumi Sorğular</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Gələn bütün sorğular</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #bbf7d0',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
              borderRadius: '0 16px 0 60px'
            }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>{totalMeetings}</div>
              <div style={{ color: '#166534', fontSize: '1rem', fontWeight: '600' }}>Ümumi Görüşmələr</div>
              <div style={{ color: '#86efac', fontSize: '0.85rem', marginTop: '4px' }}>Keçirilən bütün görüşmələr</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #fcd34d',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              borderRadius: '0 16px 0 60px'
            }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>{totalProduction}</div>
              <div style={{ color: '#92400e', fontSize: '1rem', fontWeight: '600' }}>İstehsalatda Olan İşlər</div>
              <div style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: '4px' }}>Ümumi istehsalat işləri</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #f9a8d4',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
              borderRadius: '0 16px 0 60px'
            }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ec4899', marginBottom: '8px' }}>{completedProduction}</div>
              <div style={{ color: '#be185d', fontSize: '1rem', fontWeight: '600' }}>Tamamlanan İşlər</div>
              <div style={{ color: '#f472b6', fontSize: '0.85rem', marginTop: '4px' }}>Tamamlanmış istehsalat işləri</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

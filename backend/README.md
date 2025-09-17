# Office Management Backend API

Bu backend API, ofis idarəetmə sistemi üçün Node.js, Express və MySQL istifadə edərək yaradılmışdır.

## 🚀 Quraşdırma

### 1. Tələblər
- Node.js (v14 və ya daha yuxarı)
- MySQL (v5.7 və ya daha yuxarı)
- npm və ya yarn

### 2. Paketləri yükləyin
```bash
npm install
```

### 3. Environment dəyişənlərini təyin edin
`env.example` faylını kopyalayın və `.env` adı ilə yenidən adlandırın:

```bash
cp env.example .env
```

`.env` faylını redaktə edin:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=office_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Veritabanını qurun
MySQL-də `database.sql` faylını işlədin:

```bash
mysql -u root -p < database.sql
```

### 5. Serveri başladın
```bash
# Development üçün
npm run dev

# Production üçün
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Cari istifadəçi

### Users
- `GET /api/users` - Bütün istifadəçilər
- `GET /api/users/:id` - İstifadəçi ID-yə görə
- `POST /api/users` - Yeni istifadəçi
- `PUT /api/users/:id` - İstifadəçini yenilə
- `DELETE /api/users/:id` - İstifadəçini sil

### Roles
- `GET /api/roles` - Bütün rollar

### Inquiries
- `GET /api/inquiries` - Bütün sorğular

### Meetings
- `GET /api/meetings` - Bütün görüşlər

### Projects
- `GET /api/projects` - Bütün layihələr

### Pricing
- `GET /api/pricing` - Bütün qiymətləndirmələr

## 🔐 Authentication

API-də JWT token istifadə olunur. Bütün qorunan endpoint-lər üçün `Authorization` header-i tələb olunur:

```
Authorization: Bearer your-jwt-token
```

## 🗄️ Veritabanı Strukturu

### Users
- id, name, email, password, department, position, status, role_id, join_date

### Roles
- id, name, description, permissions (JSON), is_default

### Inquiries
- id, first_name, last_name, company_name, phone, address, email, status

### Meetings
- id, inquiry_id, user_id, location, images (JSON), notes, status, meeting_date

### Projects
- id, meeting_id, user_id, project_images (JSON), project_pdf, status

### Pricing
- id, project_id, user_id, price, weight_kg, price_offer_pdf, notes, status

## 🧪 Test Hesabları

Varsayılan test hesabları:

1. **Admin**: ahmed@ofis.com / 123456
2. **Müştəri Xidmətləri**: aysu@ofis.com / 123456
3. **Layihə Meneceri**: mehemmed@ofis.com / 123456

## 🚀 Hostinger-da Deployment

1. Backend fayllarını Hostinger-ın Node.js hosting-inə yükləyin
2. MySQL veritabanını Hostinger-da qurun
3. Environment dəyişənlərini Hostinger panelində təyin edin
4. Domain-i backend API-yə yönləndirin

## 📝 Qeydlər

- Bütün şifrələr bcrypt ilə hash-lənir
- JWT token-lar 24 saat etibarlıdır
- CORS yalnız frontend domain-inə icazə verir
- Bütün xətalar JSON formatında qaytarılır






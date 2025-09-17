const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectMongo } = require('./config/mongo');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://panel.deposist.az',
  'https://deposist.az',
  'https://www.deposist.az'
];

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: function(origin, callback) {
    // Allow server-to-server or curl (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Ofis İdarəetməsi API',
    version: '1.0.0',
    status: 'running'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/pricing', require('./routes/pricing'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ofis İdarəetməsi API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Server xətası baş verdi!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Səhifə tapılmadı!' });
});

const PORT = process.env.PORT || 3001; // Hostinger Node.js default port

// Start server after MongoDB connection
connectMongo()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server ${PORT} portunda işləyir`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🌐 Production: https://yourdomain.com:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Sunucu başlatılamadı. MongoDB bağlantısı başarısız.', err.message);
    process.exit(1);
  });

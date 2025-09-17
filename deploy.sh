#!/bin/bash

# Backend deployment script for Hostinger VPS

echo "🚀 Office Admin Backend Deployment Starting..."

# Backend klasörünə keç
cd backend

# Dependencies yüklə
echo "📦 Installing dependencies..."
npm install --production

# PM2 ilə başlat
echo "🔄 Starting with PM2..."
pm2 start ecosystem.config.js --env production

# PM2 startup script əlavə et
pm2 startup
pm2 save

echo "✅ Backend deployment completed!"
echo "🌐 Backend running on port 5000"


const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[mongo] MONGODB_URI bulunamadı. Lütfen .env içine ekleyin.');
    throw new Error('MONGODB_URI is missing');
  }

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    isConnected = true;
    console.log(`✅ MongoDB bağlandı: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    throw err;
  }
}

module.exports = { connectMongo };




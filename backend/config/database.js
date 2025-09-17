// MySQL bağlantısı (mysql2/promise) — production üçün real bağlantı
const mysql = require('mysql2/promise');

let pool;

function ensurePool() {
  if (pool) return pool;

  const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.warn('[db] DB env dəyişənləri tam deyil (DB_HOST, DB_USER, DB_NAME).');
  }

  pool = mysql.createPool({
    host: DB_HOST || 'localhost',
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'office_management',
    port: DB_PORT ? Number(DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Hostinger/MySQL uzaq bağlantılarda lazım ola bilər
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

async function query(sql, params) {
  const p = ensurePool();
  return p.execute(sql, params);
}

module.exports = { query };

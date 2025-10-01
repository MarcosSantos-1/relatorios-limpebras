const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'relatorios_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    process.exit(1);
  }
};

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

module.exports = {
  pool,
  connectDB,
  query
};

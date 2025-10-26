const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskmind_dbb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
async function testConnection() {
  try {
    const conn = await connection.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso!');
    conn.release();
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
  }
}

testConnection();

module.exports = connection;
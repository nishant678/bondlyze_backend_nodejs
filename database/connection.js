const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Execute a query
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Get a connection from the pool
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Failed to get database connection:', error.message);
    throw error;
  }
}

// Close the pool
async function closePool() {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  closePool
};


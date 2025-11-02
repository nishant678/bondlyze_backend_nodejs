require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Welcome@1998',
  database: process.env.DB_NAME || 'bondlyze_db',
  port: process.env.DB_PORT || 3306,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

module.exports = dbConfig;


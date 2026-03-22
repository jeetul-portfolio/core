module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'admin',
    password: process.env.MYSQL_PASSWORD || 'supersecretpassword',
    database: process.env.MYSQL_DATABASE || 'portfolio',
    maxConnections: process.env.MYSQL_MAX_CONNECTIONS || 10,
    port: process.env.MYSQL_PORT || 3306,
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || 'my_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
};
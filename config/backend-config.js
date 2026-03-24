module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST || 'mysql-svc.mysql.svc.cluster.local',
    user: process.env.MYSQL_USER || 'admin',
    password: process.env.MYSQL_PASSWORD || 'supersecretpassword',
    database: process.env.MYSQL_DATABASE || 'portfolio',
    maxConnections: process.env.MYSQL_MAX_CONNECTIONS || 10,
    port: process.env.MYSQL_PORT || 3306,
  },
  github: {
    apiBaseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
    token: process.env.GITHUB_TOKEN || '',
    userAgent: process.env.GITHUB_USER_AGENT || 'portfolio-core-sync-service',
    maxCommitsPerRepo: Number(process.env.GITHUB_MAX_COMMITS_PER_REPO || 100),
    commitStatsConcurrency: Number(process.env.GITHUB_COMMIT_STATS_CONCURRENCY || 5),
    requestTimeoutMs: Number(process.env.GITHUB_REQUEST_TIMEOUT_MS || 15000),
    syncRepos: process.env.GITHUB_SYNC_REPOS || '',
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
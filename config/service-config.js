module.exports = {
  port: process.env.PORT || 3000,
  serviceName: process.env.SERVICE_NAME || 'core',
  logging : {
    isPretty: false, // Set to true for pretty JSON output in logs
  },
};
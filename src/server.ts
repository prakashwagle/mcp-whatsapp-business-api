import app from './app';
import config from './config';
import logger from './utils/logger';

// Get port from environment or use default
const port = config.server.port;

// Start server
const server = app.listen(port, () => {
  logger.info(`Server started on port ${port} in ${config.server.nodeEnv} mode`);
  logger.info(`MCP Server Name: ${config.mcp.serverName}`);
  logger.info(`MCP Server Version: ${config.mcp.serverVersion}`);
  logger.info(`Health Check: http://localhost:${port}/health`);
  logger.info(`MCP Endpoint: http://localhost:${port}/mcp`);
  logger.info(`API Endpoints:`);
  logger.info(`- GET    /api/business-profile`);
  logger.info(`- PUT    /api/business-profile`);
  logger.info(`- POST   /api/registration/register`);
  logger.info(`- POST   /api/registration/deregister`);
  logger.info(`- POST   /api/registration/request-code`);
  logger.info(`- POST   /api/registration/verify-code`);
  logger.info(`- POST   /api/messages/text`);
  logger.info(`- POST   /api/messages/template`);
  logger.info(`- GET    /api/phone-numbers`);
  logger.info(`- POST   /api/two-step-verification`);
});

// Handle shutdown gracefully
const shutdown = () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Server shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
};

// Handle graceful shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;
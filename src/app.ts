import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createMcpServer } from './mcp/server';
import { errorHandler, notFound } from './middleware/errorHandler';
import config from './config';
import logger from './utils/logger';

// Import routes
import businessProfileRoutes from './routes/businessProfileRoutes';
import registrationRoutes from './routes/registrationRoutes';
import messagesRoutes from './routes/messagesRoutes';
import phoneNumbersRoutes from './routes/phoneNumbersRoutes';
import twoStepVerificationRoutes from './routes/twoStepVerificationRoutes';

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// Logging
if (config.server.isDevelopment) {
  app.use(morgan('dev')); // HTTP request logger
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/business-profile', businessProfileRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/phone-numbers', phoneNumbersRoutes);
app.use('/api/two-step-verification', twoStepVerificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: config.mcp.serverName,
    version: config.mcp.serverVersion,
    timestamp: new Date().toISOString(),
  });
});

// Setup MCP server
createMcpServer(app);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
// src/index.ts
import dotenv from 'dotenv';
import { startMcpServer } from './server.js';
import { loadConfig } from './utils/config.js';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Start the MCP server with Express
    await startMcpServer(config);
    
    console.log('MCP WhatsApp API server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
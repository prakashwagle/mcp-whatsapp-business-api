#!/usr/bin/env node
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
    
    // Start the MCP server with stdio transport
    await startMcpServer(config);
    
    // Note: Don't use console.log as it will interfere with the stdio transport
    // Use console.error instead for logging as it goes to stderr instead of stdout
    console.error('MCP WhatsApp API server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
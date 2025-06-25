#!/usr/bin/env node
// src/index.ts
import dotenv from 'dotenv';
import { startMcpServer, startMcpServerStdio } from './server.js';
import { loadConfig } from './utils/config.js';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Load configuration
    const config = loadConfig();

    // Determine transport mode - default to SSE for localhost compatibility  
    const transportMode = process.env.MCP_TRANSPORT_MODE || 'sse';

    if (transportMode === 'stdio') {
      // Start MCP server with stdio transport for Claude Desktop
      await startMcpServerStdio(config);
      
      // Note: Don't use console.log as it will interfere with the stdio transport
      // Use console.error instead for logging as it goes to stderr instead of stdout
      console.error('MCP WhatsApp API server started successfully (stdio mode)');
    } else {
      // Start MCP server with HTTP/SSE transport for localhost and webhooks
      await startMcpServer(config);
      console.error('MCP WhatsApp API server started successfully (SSE mode)');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

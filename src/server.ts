// src/server.ts
import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Config } from './utils/config.js';
import { WhatsAppApiClient } from './utils/api-client.js';
import { DatabaseClient } from './utils/database.js';

// Import API tools
import { setupBusinessProfileTools } from './api/business.js';
import { setupRegistrationTools } from './api/registration.js';
import { setupMessagesTools } from './api/messages.js';
import { setupPhoneNumberTools } from './api/phone.js';
import { setupVerificationTools } from './api/verification.js';
import { setupDatabaseTools } from './api/database.js';

// Import resources
import { setupBusinessProfileResource } from './api/resources/business-profile.js';
import { setupTemplateCatalogsResource } from './api/resources/template-catalogs.js';
import { setupPhoneNumberResources } from './api/resources/phone-numbers.js';
import { setupDatabaseResources } from './api/resources/database.js';

// Import prompts
import { setupWhatsAppPrompts } from './api/prompts/whatsapp-prompts.js';

export async function startMcpServer(config: Config) {
  // Create the WhatsApp API client
  const apiClient = new WhatsAppApiClient(config);

  // Create database client if configuration is provided
  let dbClient: DatabaseClient | null = null;
  if (config.database) {
    try {
      dbClient = new DatabaseClient(config.database);
      const isConnected = await dbClient.testConnection();
      if (isConnected) {
        console.error('✅ Database connected successfully');
      } else {
        console.error('⚠️ Database connection test failed');
      }
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    }
  }

  // Create the MCP server
  const server = new McpServer({
    name: 'WhatsApp Cloud API',
    version: '1.0.0',
    description: 'WhatsApp Cloud Business API exposed via MCP',
  });

  // Setup tools for each API category
  setupBusinessProfileTools(server, apiClient);
  setupRegistrationTools(server, apiClient);
  setupMessagesTools(server, apiClient);
  setupPhoneNumberTools(server, apiClient);
  setupVerificationTools(server, apiClient);

  // Setup database tools if database is available
  if (dbClient) {
    setupDatabaseTools(server, dbClient);
  }

  // Setup resources
  setupBusinessProfileResource(server, apiClient);
  setupTemplateCatalogsResource(server, apiClient);
  setupPhoneNumberResources(server, apiClient);

  // Setup database resources if database is available
  if (dbClient) {
    setupDatabaseResources(server, dbClient);
  }

  // Setup prompts
  setupWhatsAppPrompts(server);

  // Create Express app
  const app = express();

  // To support multiple simultaneous connections we have a lookup object from
  // sessionId to transport
  const transports: { [sessionId: string]: SSEServerTransport } = {};

  // Set up SSE endpoint
  app.get('/mcp/sse', async (_: Request, res: Response) => {
    const transport = new SSEServerTransport('/mcp/messages', res);
    transports[transport.sessionId] = transport;

    res.on('close', () => {
      delete transports[transport.sessionId];
      console.log(`Connection closed for session ${transport.sessionId}`);
    });

    await server.connect(transport);
    console.log(
      `New SSE connection established with session ID: ${transport.sessionId}`
    );
  });

  // Set up messages endpoint
  app.post('/mcp/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports[sessionId];

    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send('No transport found for sessionId');
    }
  });

  // Add health check endpoint
  app.get('/health', (_: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // Start the server
  const httpServer = app.listen(config.serverPort, () => {
    console.log(`MCP server started on port ${config.serverPort}`);
    console.log(
      `SSE endpoint available at http://localhost:${config.serverPort}/mcp/sse`
    );
    console.log(
      `Messages endpoint available at http://localhost:${config.serverPort}/mcp/messages`
    );
  });

  return { server, app, httpServer };
}

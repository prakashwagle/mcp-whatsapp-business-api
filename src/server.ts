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
import { setupAnalyticsResources } from './api/resources/analytics.js';

// Import prompts
import { setupWhatsAppPrompts } from './api/prompts/whatsapp-prompts.js';
import { eventEmitter } from './utils/event-emitter.js';

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
  setupAnalyticsResources(server, apiClient);

  // Setup database resources if database is available
  if (dbClient) {
    setupDatabaseResources(server, dbClient);
  }

  // Setup prompts
  setupWhatsAppPrompts(server);

  // Create Express app
  const app = express();

  // Add JSON parsing middleware
  app.use(express.json());

  // To support multiple simultaneous connections we have a lookup object from
  // sessionId to transport
  const transports: { [sessionId: string]: SSEServerTransport } = {};

  // Set up event broadcasting to all connected SSE clients
  eventEmitter.on('whatsapp_event', event => {
    const eventData = JSON.stringify(event);

    // Broadcast to all connected transports
    Object.values(transports).forEach(transport => {
      try {
        // Send event as SSE data via the response object
        const res = (transport as any).response;
        if (res && !res.destroyed) {
          res.write(`data: ${eventData}\n\n`);
        }
      } catch (error) {
        console.error('Error broadcasting event to transport:', error);
      }
    });
  });

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

  // Add webhook verification endpoint (GET)
  app.get('/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify the webhook token
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('Failed to verify webhook');
      res.status(403).send('Forbidden');
    }
  });

  // Add webhook receiver endpoint (POST)
  app.post('/webhook', async (req: Request, res: Response) => {
    const body = req.body;

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Process incoming webhook data (simplified - no rate limiting on WhatsApp APIs)
    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          if (change.field === 'messages') {
            const value = change.value;

            // Handle incoming messages
            if (value.messages) {
              value.messages.forEach((message: any) => {
                eventEmitter.emitWhatsAppEvent({
                  type: 'message_received',
                  timestamp: new Date(),
                  data: {
                    messageId: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    type: message.type,
                    content:
                      message.text ||
                      message.image ||
                      message.audio ||
                      message.document ||
                      message.video ||
                      message.sticker ||
                      message,
                    phoneNumberId: value.metadata?.phone_number_id,
                  },
                });
              });
            }

            // Handle message status updates
            if (value.statuses) {
              value.statuses.forEach((status: any) => {
                eventEmitter.emitWhatsAppEvent({
                  type: 'message_status_update',
                  timestamp: new Date(),
                  data: {
                    messageId: status.id,
                    status: status.status,
                    timestamp: status.timestamp,
                    recipientId: status.recipient_id,
                    phoneNumberId: value.metadata?.phone_number_id,
                  },
                });
              });
            }
          }
        });
      });
    }

    res.status(200).send('OK');
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

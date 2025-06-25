// src/server.ts
import express, { Request, Response } from 'express';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

// Function to create and setup the MCP server with all tools and resources
async function createMcpServer(config: Config, dbClient: DatabaseClient | null = null) {
  // Create the WhatsApp API client
  const apiClient = new WhatsAppApiClient(config);

  // Create the MCP server
  const server = new McpServer({
    name: 'WhatsApp Cloud API',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  });

  // Setup all tools
  setupBusinessProfileTools(server, apiClient);
  setupRegistrationTools(server, apiClient);
  setupMessagesTools(server, apiClient);
  setupPhoneNumberTools(server, apiClient);
  setupVerificationTools(server, apiClient);
  
  if (dbClient) {
    setupDatabaseTools(server, dbClient);
  }

  // Setup all resources
  setupBusinessProfileResource(server, apiClient);
  setupTemplateCatalogsResource(server, apiClient);
  setupPhoneNumberResources(server, apiClient);
  // setupAnalyticsResources(server, apiClient); // Disabled due to ResourceTemplate issues
  
  if (dbClient) {
    setupDatabaseResources(server, dbClient);
  }

  // Add analytics resources using simple registration
  server.resource('whatsapp://analytics/summary', 'WhatsApp Analytics Summary', async () => {
    return {
      contents: [{
        uri: 'whatsapp://analytics/summary',
        text: `WhatsApp Analytics Summary
=========================

📊 Quick Overview (Last 7 days)
- Total messages sent: Available via API
- Delivery rate: Available via API  
- Conversation costs: Available via API
- Template performance: Available via API

📈 Available Analytics:
- Browse whatsapp://analytics/messaging
- Browse whatsapp://analytics/conversations
- Browse whatsapp://analytics/templates

Note: Full analytics require WhatsApp Business API permissions.`
      }]
    };
  });

  server.resource('whatsapp://analytics/messaging', 'WhatsApp Messaging Analytics', async () => {
    try {
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago
      
      const response = await apiClient.get(
        `${apiClient.getBusinessAccountEndpoint()}/insights?` +
          `metric=messages_sent,messages_delivered&` +
          `start=${startTime}&` +
          `end=${endTime}&` +
          `granularity=DAILY`
      );

      const insights = response.data.data;
      let analyticsData = `WhatsApp Messaging Analytics\n`;
      analyticsData += `============================\n\n`;
      analyticsData += `📊 Last 30 Days Performance\n`;
      analyticsData += `Period: ${new Date(startTime * 1000).toLocaleDateString()} - ${new Date(endTime * 1000).toLocaleDateString()}\n\n`;

      if (insights && insights.length > 0) {
        insights.forEach((insight: any) => {
          analyticsData += `📈 ${insight.name}:\n`;
          if (insight.values && insight.values.length > 0) {
            insight.values.forEach((value: any) => {
              const date = new Date(value.end_time * 1000).toLocaleDateString();
              analyticsData += `  ${date}: ${value.value}\n`;
            });
          }
          analyticsData += `\n`;
        });
      } else {
        analyticsData += `No analytics data available for the specified period.\n`;
      }

      return {
        contents: [{
          uri: 'whatsapp://analytics/messaging',
          text: analyticsData
        }]
      };
    } catch (error: any) {
      return {
        contents: [{
          uri: 'whatsapp://analytics/messaging',
          text: `Error retrieving messaging analytics: ${error.response?.data?.error?.message || error.message}\n\nNote: This requires WhatsApp Business Management API permissions.`
        }]
      };
    }
  });

  // Setup prompts
  setupWhatsAppPrompts(server);

  // Add a simple contacts resource
  server.resource(
    'contacts',
    new ResourceTemplate('whatsapp://contacts', {
      list: undefined,
    }),
    async (uri: any) => {
      if (dbClient) {
        try {
          const result = await dbClient.query('SELECT name, phone_number, frequency_preference FROM whatsapp_contacts ORDER BY reply_count DESC LIMIT 10');
          const contacts = result.rows.map(row => `${row.name} (${row.phone_number}) - ${row.frequency_preference}`).join('\n');
          return {
            contents: [{
              uri: uri.href,
              text: `WhatsApp Contacts:\n==================\n\n${contacts}`
            }]
          };
        } catch (error: any) {
          return {
            contents: [{
              uri: uri.href,
              text: `Error loading contacts: ${error.message}`
            }]
          };
        }
      } else {
        return {
          contents: [{
            uri: uri.href,
            text: 'Database not connected'
          }]
        };
      }
    }
  );

  return { server, apiClient, dbClient };
}

// Stdio transport mode (for Claude Desktop)
export async function startMcpServerStdio(config: Config) {
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

  const { server } = await createMcpServer(config, dbClient);

  // Use stdio transport for Claude Desktop
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  return { server, transport };
}

// HTTP transport mode (for modern MCP clients and webhooks)
export async function startMcpServer(config: Config) {
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

  const { server, apiClient } = await createMcpServer(config, dbClient);

  // Create Express app
  const app = express();

  // Add JSON parsing middleware
  app.use(express.json());

  // To support multiple simultaneous connections we have a lookup object from
  // sessionId to transport (keeping SSE for backward compatibility)
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

  // Modern HTTP endpoint for MCP (preferred)
  app.post('/mcp', express.json(), async (req: Request, res: Response) => {
    try {
      // Create a new transport for each request (stateless HTTP)
      const transport = new SSEServerTransport('/mcp', res);
      
      // Connect the server to this transport
      await server.connect(transport);
      
      // Handle the request through the transport
      await transport.handlePostMessage(req, res);
    } catch (error) {
      console.error('Error handling MCP HTTP request:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Legacy SSE endpoint (for backward compatibility)
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

  // Legacy messages endpoint
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
      `Modern HTTP endpoint: http://localhost:${config.serverPort}/mcp`
    );
    console.log(
      `Legacy SSE endpoint: http://localhost:${config.serverPort}/mcp/sse`
    );
    console.log(
      `Health check: http://localhost:${config.serverPort}/health`
    );
  });

  return { server, app, httpServer };
}

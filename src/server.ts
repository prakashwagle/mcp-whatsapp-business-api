// src/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Config } from './utils/config.js';
import { WhatsAppApiClient } from './utils/api-client.js';

// Import API tools
import { setupBusinessProfileTools } from './api/business.js';
import { setupRegistrationTools } from './api/registration.js';
import { setupMessagesTools } from './api/messages.js';
import { setupPhoneNumberTools } from './api/phone.js';
import { setupVerificationTools } from './api/verification.js';

// Import resources
import { setupBusinessProfileResource } from './api/resources/business-profile.js';
import { setupTemplateCatalogsResource } from './api/resources/template-catalogs.js';

// Import prompts
import { setupWhatsAppPrompts } from './api/prompts/whatsapp-prompts.js';

export async function startMcpServer(config: Config) {
  // Create the WhatsApp API client
  const apiClient = new WhatsAppApiClient(config);
  
  // Create the MCP server
  const server = new McpServer({
    name: "WhatsApp Cloud API",
    version: "1.0.0",
    description: "WhatsApp Cloud Business API exposed via MCP"
  });
  
  // Setup tools for each API category
  setupBusinessProfileTools(server, apiClient);
  setupRegistrationTools(server, apiClient);
  setupMessagesTools(server, apiClient);
  setupPhoneNumberTools(server, apiClient);
  setupVerificationTools(server, apiClient);
  
  // Setup resources
  setupBusinessProfileResource(server, apiClient);
  setupTemplateCatalogsResource(server, apiClient);
  
  // Setup prompts
  setupWhatsAppPrompts(server);
  
  // Create a stdio transport (handles stdin/stdout communication)
  const transport = new StdioServerTransport();
  
  // Connect the server to the transport
  await server.connect(transport);
  
  console.error(`MCP server started using stdio transport`);
  
  return server;
}
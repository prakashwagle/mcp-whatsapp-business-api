// @ts-ignore - Ignore type errors for the MCP imports
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// @ts-ignore - Ignore type errors for the MCP imports
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import config from '../config';
import logger from '../utils/logger';

// Import resources
import {
  businessProfileSchema,
  phoneNumbersSchema,
  getBusinessProfileResource,
  getPhoneNumbersResource,
} from './resources';

// Import tools
import {
  updateBusinessProfileSchema,
  sendTextMessageSchema,
  sendTemplateMessageSchema,
  registerPhoneNumberSchema,
  setTwoStepVerificationSchema,
  updateBusinessProfile,
  sendTextMessage,
  sendTemplateMessage,
  registerPhoneNumber,
  setTwoStepVerification,
} from './tools';

// Import prompts
import {
  helpWithBusinessProfileSchema,
  helpWithMessagingSchema,
  helpWithRegistrationSchema,
  helpWithTwoStepVerificationSchema,
  helpWithBusinessProfile,
  helpWithMessaging,
  helpWithRegistration,
  helpWithTwoStepVerification,
} from './prompts';

// Create MCP server
export const createMcpServer = (app: any) => {
  const mcpServer = new McpServer({
    name: config.mcp.serverName,
    version: config.mcp.serverVersion,
  });

  // Register resources
  mcpServer.resource('businessProfile', businessProfileSchema, getBusinessProfileResource);
  mcpServer.resource('phoneNumbers', phoneNumbersSchema, getPhoneNumbersResource);

  // Register tools
  mcpServer.tool('updateBusinessProfile', updateBusinessProfileSchema, updateBusinessProfile);
  mcpServer.tool('sendTextMessage', sendTextMessageSchema, sendTextMessage);
  mcpServer.tool('sendTemplateMessage', sendTemplateMessageSchema, sendTemplateMessage);
  mcpServer.tool('registerPhoneNumber', registerPhoneNumberSchema, registerPhoneNumber);
  mcpServer.tool('setTwoStepVerification', setTwoStepVerificationSchema, setTwoStepVerification);

  // Register prompts
  mcpServer.prompt('helpWithBusinessProfile', helpWithBusinessProfileSchema, helpWithBusinessProfile);
  mcpServer.prompt('helpWithMessaging', helpWithMessagingSchema, helpWithMessaging);
  mcpServer.prompt('helpWithRegistration', helpWithRegistrationSchema, helpWithRegistration);
  mcpServer.prompt('helpWithTwoStepVerification', helpWithTwoStepVerificationSchema, helpWithTwoStepVerification);

  // Create SSE transport
  const sseTransport = new SSEServerTransport({
    server: mcpServer,
    basePath: '/mcp',
  });

  // Connect transport to Express app
  sseTransport.connect(app);

  logger.info('MCP server initialized with SSE transport');

  return mcpServer;
};
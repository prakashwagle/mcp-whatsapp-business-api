import { McpServer, HttpTransport } from '@modelcontextprotocol/sdk';
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

  // Create HTTP transport
  const httpTransport = new HttpTransport({
    server: mcpServer,
    basePath: '/mcp',
  });

  // Connect transport to Express app
  httpTransport.connect(app);

  logger.info('MCP server initialized with HTTP transport');

  return mcpServer;
};
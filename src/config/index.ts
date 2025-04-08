import env from './env';

const config = {
  server: {
    port: parseInt(env.PORT, 10),
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  whatsapp: {
    apiVersion: env.WHATSAPP_API_VERSION,
    apiBaseUrl: env.WHATSAPP_API_BASE_URL,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
  },
  mcp: {
    serverName: env.MCP_SERVER_NAME,
    serverVersion: env.MCP_SERVER_VERSION,
    serverBaseUrl: env.MCP_SERVER_BASE_URL,
  },
};

export default config;
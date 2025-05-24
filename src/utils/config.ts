// Configuration utilities
export interface Config {
  whatsappApiVersion: string;
  whatsappAccessToken: string;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  serverPort: number;
  database?: DatabaseConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export function loadConfig(): Config {
  // Ensure required environment variables are set
  const requiredEnvVars = [
    'WHATSAPP_API_VERSION',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    'SERVER_PORT',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  const config: Config = {
    whatsappApiVersion: process.env.WHATSAPP_API_VERSION!,
    whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
    whatsappBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
    serverPort: parseInt(process.env.SERVER_PORT!, 10),
  };

  // Optional database configuration
  if (process.env.DATABASE_HOST) {
    config.database = {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME!,
      username: process.env.DATABASE_USERNAME!,
      password: process.env.DATABASE_PASSWORD!,
      ssl: process.env.DATABASE_SSL === 'true',
    };
  }

  return config;
}

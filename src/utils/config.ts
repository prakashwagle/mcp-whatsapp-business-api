// Configuration utilities 
export interface Config {
    whatsappApiVersion: string;
    whatsappAccessToken: string;
    whatsappPhoneNumberId: string;
    whatsappBusinessAccountId: string;
    serverPort: number;
  }
  
  export function loadConfig(): Config {
    // Ensure required environment variables are set
    const requiredEnvVars = [
      'WHATSAPP_API_VERSION',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'SERVER_PORT'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );
    
    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }
    
    return {
      whatsappApiVersion: process.env.WHATSAPP_API_VERSION!,
      whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      whatsappBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
      serverPort: parseInt(process.env.SERVER_PORT!, 10)
    };
  }
// AWS SSM Parameter Store integration for production secrets
import {
  SSMClient,
  GetParameterCommand,
  GetParametersCommand,
} from '@aws-sdk/client-ssm';

export class SecretsManager {
  private ssmClient: SSMClient | null = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';

    if (this.isProduction) {
      this.ssmClient = new SSMClient({
        region: process.env.AWS_REGION || 'us-east-1',
      });
    }
  }

  async getSecret(
    parameterName: string,
    fallbackEnvVar?: string
  ): Promise<string> {
    // In development, use environment variables
    if (!this.isProduction) {
      const envValue = process.env[fallbackEnvVar || parameterName];
      if (!envValue) {
        throw new Error(
          `Environment variable ${fallbackEnvVar || parameterName} not found`
        );
      }
      return envValue;
    }

    // In production, use AWS SSM Parameter Store
    if (!this.ssmClient) {
      throw new Error('SSM client not initialized');
    }

    try {
      const command = new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true, // For SecureString parameters
      });

      const response = await this.ssmClient.send(command);

      if (!response.Parameter?.Value) {
        throw new Error(`Parameter ${parameterName} not found in SSM`);
      }

      return response.Parameter.Value;
    } catch (error: any) {
      console.error(
        `Error fetching parameter ${parameterName} from SSM:`,
        error.message
      );

      // Fallback to environment variable if SSM fails
      const envValue = process.env[fallbackEnvVar || parameterName];
      if (envValue) {
        console.warn(
          `Using fallback environment variable for ${parameterName}`
        );
        return envValue;
      }

      throw error;
    }
  }

  async getSecrets(parameterNames: string[]): Promise<Record<string, string>> {
    if (!this.isProduction) {
      // In development, return environment variables
      const secrets: Record<string, string> = {};
      for (const name of parameterNames) {
        const value = process.env[name];
        if (value) {
          secrets[name] = value;
        }
      }
      return secrets;
    }

    // In production, batch fetch from SSM
    if (!this.ssmClient) {
      throw new Error('SSM client not initialized');
    }

    try {
      const command = new GetParametersCommand({
        Names: parameterNames,
        WithDecryption: true,
      });

      const response = await this.ssmClient.send(command);

      const secrets: Record<string, string> = {};

      response.Parameters?.forEach(param => {
        if (param.Name && param.Value) {
          secrets[param.Name] = param.Value;
        }
      });

      // Check for any missing parameters
      const missing = parameterNames.filter(name => !secrets[name]);
      if (missing.length > 0) {
        console.warn(`Missing SSM parameters: ${missing.join(', ')}`);
      }

      return secrets;
    } catch (error: any) {
      console.error('Error fetching parameters from SSM:', error.message);
      throw error;
    }
  }
}

// src/api/registration.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';

// Define schema for registering a phone number
const RegisterPhoneNumberSchema = z.object({
  pin: z.string().length(6),
  data_localization_region: z.enum(['APAC', 'US', 'EU']).optional()
});

// Define schema for deregistering a phone number
const DeregisterPhoneNumberSchema = z.object({});

// Define schema for verifying a phone number
const VerifyPhoneNumberSchema = z.object({
  code: z.string(),
});

export function setupRegistrationTools(server: McpServer, apiClient: WhatsAppApiClient) {
  // Tool: Register Phone Number
  server.tool(
    "whatsapp_register_phone_number",
    RegisterPhoneNumberSchema.shape,
    async (params) => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/register`,
          {
            messaging_product: "whatsapp",
            ...params
          }
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Phone number registration initiated: ${JSON.stringify(response.data, null, 2)}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error registering phone number: ${error.message}`
            }
          ]
        };
      }
    }
  );
  
  // Tool: Deregister Phone Number
  server.tool(
    "whatsapp_deregister_phone_number",
    DeregisterPhoneNumberSchema.shape,
    async () => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/deregister`,
          {
            messaging_product: "whatsapp"
          }
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Phone number deregistration initiated: ${JSON.stringify(response.data, null, 2)}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error deregistering phone number: ${error.message}`
            }
          ]
        };
      }
    }
  );
  
  // Tool: Verify Phone Number
  server.tool(
    "whatsapp_verify_phone_number",
    VerifyPhoneNumberSchema.shape,
    async (params) => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/verify`,
          {
            messaging_product: "whatsapp",
            code: params.code
          }
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Phone number verification completed: ${JSON.stringify(response.data, null, 2)}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error verifying phone number: ${error.message}`
            }
          ]
        };
      }
    }
  );
  
  // Tool: Get Phone Number Registration Status
  server.tool(
    "whatsapp_check_registration_status",
    {},
    async () => {
      try {
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/phone_numbers`
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Phone number registration status: ${JSON.stringify(response.data, null, 2)}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking phone number registration status: ${error.message}`
            }
          ]
        };
      }
    }
  );
}
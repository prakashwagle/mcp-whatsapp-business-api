// src/api/verification.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';

// Define schema for enabling two-step verification
const EnableTwoStepVerificationSchema = z.object({
  pin: z.string().length(6)
});

// Define schema for disabling two-step verification
const DisableTwoStepVerificationSchema = z.object({});

export function setupVerificationTools(server: McpServer, apiClient: WhatsAppApiClient) {
  // Tool: Enable Two-Step Verification
  server.tool(
    "whatsapp_enable_two_step_verification",
    EnableTwoStepVerificationSchema.shape,
    async (params) => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/two_step`,
          {
            pin: params.pin
          }
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Two-step verification enabled: ${JSON.stringify(response.data, null, 2)}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error enabling two-step verification: ${error.message}`
            }
          ]
        };
      }
    }
  );
  
  // Tool: Disable Two-Step Verification
  server.tool(
    "whatsapp_disable_two_step_verification",
    DisableTwoStepVerificationSchema.shape,
    async () => {
      try {
        const response = await apiClient.delete(
          `${apiClient.getPhoneNumberEndpoint()}/two_step`
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Two-step verification disabled: ${JSON.stringify(response.data, null, 2)}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error disabling two-step verification: ${error.message}`
            }
          ]
        };
      }
    }
  );
}
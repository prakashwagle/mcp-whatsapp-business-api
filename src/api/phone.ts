// src/api/phone.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';

// Define schema for getting phone numbers
const GetPhoneNumbersSchema = z.object({});

// Define schema for getting a specific phone number
const GetPhoneNumberSchema = z.object({
  phone_number_id: z.string().optional(),
});

// Define schema for requesting a verification code
const RequestVerificationCodeSchema = z.object({
  code_method: z.enum(['SMS', 'VOICE']),
  locale: z.string().optional(),
});

export function setupPhoneNumberTools(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Tool: Get All Phone Numbers
  server.tool(
    'whatsapp_get_phone_numbers',
    GetPhoneNumbersSchema.shape,
    async () => {
      try {
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/phone_numbers`
        );

        return {
          content: [
            {
              type: 'text',
              text: `Phone numbers: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting phone numbers: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: Get Phone Number Details
  server.tool(
    'whatsapp_get_phone_number_details',
    GetPhoneNumberSchema.shape,
    async params => {
      try {
        const phoneNumberId =
          params.phone_number_id ||
          apiClient.getPhoneNumberEndpoint().substring(1);
        const response = await apiClient.get(`/${phoneNumberId}`);

        return {
          content: [
            {
              type: 'text',
              text: `Phone number details: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting phone number details: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: Request Verification Code
  server.tool(
    'whatsapp_request_verification_code',
    RequestVerificationCodeSchema.shape,
    async params => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/request_code`,
          {
            code_method: params.code_method,
            locale: params.locale || 'en_US',
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: `Verification code requested: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error requesting verification code: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

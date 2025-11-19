import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';
import { formatApiError, formatSuccessResponse } from '../utils/error-handler.js';

// Define schema for registering a phone number
const RegisterPhoneNumberSchema = z.object({
  pin: z.string().length(6),
  data_localization_region: z.enum(['APAC', 'US', 'EU']).optional(),
});

// Define schema for deregistering a phone number
const DeregisterPhoneNumberSchema = z.object({});

// Define schema for verifying a phone number
const VerifyPhoneNumberSchema = z.object({
  code: z.string(),
});

export function setupRegistrationTools(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Tool: Register Phone Number
  server.tool(
    'whatsapp_register_phone_number',
    RegisterPhoneNumberSchema.shape,
    async params => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/register`,
          {
            messaging_product: 'whatsapp',
            ...params,
          }
        );

        return formatSuccessResponse(response.data, 'Phone number registration initiated');
      } catch (error: any) {
        return formatApiError(error, 'registering phone number');
      }
    }
  );

  // Tool: Deregister Phone Number
  server.tool(
    'whatsapp_deregister_phone_number',
    DeregisterPhoneNumberSchema.shape,
    async () => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/deregister`,
          {
            messaging_product: 'whatsapp',
          }
        );

        return formatSuccessResponse(response.data, 'Phone number deregistration initiated');
      } catch (error: any) {
        return formatApiError(error, 'deregistering phone number');
      }
    }
  );

  // Tool: Verify Phone Number
  server.tool(
    'whatsapp_verify_phone_number',
    VerifyPhoneNumberSchema.shape,
    async params => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/verify`,
          {
            messaging_product: 'whatsapp',
            code: params.code,
          }
        );

        return formatSuccessResponse(response.data, 'Phone number verification completed');
      } catch (error: any) {
        return formatApiError(error, 'verifying phone number');
      }
    }
  );

  // Tool: Get Phone Number Registration Status
  server.tool('whatsapp_check_registration_status', {}, async () => {
    try {
      const response = await apiClient.get(
        `${apiClient.getBusinessAccountEndpoint()}/phone_numbers`
      );

      return formatSuccessResponse(response.data, 'Phone number registration status');
    } catch (error: any) {
      return formatApiError(error, 'checking phone number registration status');
    }
  });
}

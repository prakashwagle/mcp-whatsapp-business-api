import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';
import { formatApiError, formatSuccessResponse } from '../utils/error-handler.js';

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

        return formatSuccessResponse(response.data, 'Phone numbers retrieved successfully');
      } catch (error: any) {
        return formatApiError(error, 'getting phone numbers');
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

        return formatSuccessResponse(response.data, 'Phone number details retrieved successfully');
      } catch (error: any) {
        return formatApiError(error, 'getting phone number details');
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

        return formatSuccessResponse(response.data, 'Verification code requested successfully');
      } catch (error: any) {
        return formatApiError(error, 'requesting verification code');
      }
    }
  );
}

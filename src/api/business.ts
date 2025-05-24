// src/api/business.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';

// Define schema for business profile data
const BusinessProfileSchema = z.object({
  about: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  vertical: z
    .enum([
      'AUTOMOTIVE',
      'BEAUTY_SPA_AND_SALON',
      'CLOTHING_AND_APPAREL',
      'EDUCATION',
      'ENTERTAINMENT',
      'EVENT_PLANNING_AND_SERVICE',
      'FINANCE_AND_BANKING',
      'FOOD_AND_GROCERY',
      'GOVERNMENT',
      'HEALTH_AND_MEDICAL',
      'HOME_IMPROVEMENT',
      'HOTEL_AND_LODGING',
      'NONPROFIT',
      'PROFESSIONAL_SERVICES',
      'RETAIL',
      'SHOPPING_AND_RETAIL',
      'TRAVEL_AND_TRANSPORTATION',
      'RESTAURANT',
      'OTHER',
    ])
    .optional(),
  websites: z.array(z.string().url()).optional(),
  profile_picture_url: z.string().url().optional(),
});

// Define schema for get business profile
const GetBusinessProfileSchema = z.object({});

// Define schema for update business profile
const UpdateBusinessProfileSchema = BusinessProfileSchema;

export function setupBusinessProfileTools(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Tool: Get Business Profile
  server.tool(
    'whatsapp_get_business_profile',
    GetBusinessProfileSchema.shape,
    async () => {
      try {
        const response = await apiClient.get(
          `${apiClient.getPhoneNumberEndpoint()}/whatsapp_business_profile`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting business profile: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: Update Business Profile
  server.tool(
    'whatsapp_update_business_profile',
    UpdateBusinessProfileSchema.shape,
    async params => {
      try {
        // Filter out undefined values
        const updateData = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined)
        );

        // Ensure we have at least one field to update
        if (Object.keys(updateData).length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: At least one field must be provided to update the business profile',
              },
            ],
          };
        }

        const response = await apiClient.patch(
          `${apiClient.getPhoneNumberEndpoint()}/whatsapp_business_profile`,
          {
            messaging_product: 'whatsapp',
            ...updateData,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: `Business profile updated successfully: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating business profile: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

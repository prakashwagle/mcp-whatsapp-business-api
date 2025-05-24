// src/api/resources/business-profile.ts
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { WhatsAppApiClient } from '../../utils/api-client.js';

export function setupBusinessProfileResource(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Resource for business profile information
  server.resource(
    'business_profile',
    new ResourceTemplate('whatsapp://business_profile', {
      list: undefined,
    }),
    async uri => {
      try {
        // Call the WhatsApp API to get business profile information
        const response = await apiClient.get(
          `${apiClient.getPhoneNumberEndpoint()}/whatsapp_business_profile`
        );

        // Format the response data
        const profileData = response.data.data[0];
        const formattedProfile = `
Business Profile Information:
---------------------------
About: ${profileData.about || 'Not set'}
Address: ${profileData.address || 'Not set'}
Description: ${profileData.description || 'Not set'}
Email: ${profileData.email || 'Not set'}
Websites: ${profileData.websites?.join(', ') || 'None'}
Vertical: ${profileData.vertical || 'Not set'}
`;

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedProfile,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving business profile: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

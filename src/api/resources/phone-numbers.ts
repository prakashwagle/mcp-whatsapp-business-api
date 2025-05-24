// src/api/resources/phone-numbers.ts
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { WhatsAppApiClient } from '../../utils/api-client.js';

export function setupPhoneNumberResources(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Resource for all phone numbers
  server.resource(
    'phone_numbers',
    new ResourceTemplate('whatsapp://phone_numbers', {
      list: undefined,
    }),
    async uri => {
      try {
        // Call the WhatsApp API to get all phone numbers
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/phone_numbers`
        );

        // Format the response data
        const phoneNumbers = response.data.data || [];
        let formattedData = `Phone Numbers\n=============\n\n`;

        if (phoneNumbers.length === 0) {
          formattedData += 'No phone numbers found.\n';
        } else {
          phoneNumbers.forEach((phone: any, index: number) => {
            formattedData += `${index + 1}. Phone Number: ${phone.display_phone_number}\n`;
            formattedData += `   ID: ${phone.id}\n`;
            formattedData += `   Status: ${phone.status || 'Unknown'}\n`;
            formattedData += `   Verified: ${phone.verified_name || 'N/A'}\n`;
            formattedData += `   Code Method: ${phone.code_verification_status || 'N/A'}\n`;
            formattedData += `   Quality Rating: ${phone.quality_rating || 'N/A'}\n`;
            formattedData += `   Platform: ${phone.platform || 'N/A'}\n`;
            formattedData += `   Throughput: ${phone.throughput || 'N/A'}\n\n`;
          });
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching phone numbers: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource for specific phone number details
  server.resource(
    'phone_number_details',
    new ResourceTemplate('whatsapp://phone_number/{phone_number_id}', {
      list: undefined,
    }),
    async uri => {
      try {
        // Extract phone number ID from URI
        const urlParts = uri.href.split('/');
        const phoneNumberId = urlParts[urlParts.length - 1];

        // Use configured phone number ID if not provided in URI
        const targetPhoneNumberId =
          phoneNumberId === '{phone_number_id}'
            ? apiClient.getPhoneNumberEndpoint().substring(1)
            : phoneNumberId;

        // Call the WhatsApp API to get phone number details
        const response = await apiClient.get(`/${targetPhoneNumberId}`);

        // Format the response data
        const phoneData = response.data;
        const formattedData = `
Phone Number Details
===================
ID: ${phoneData.id || 'N/A'}
Display Number: ${phoneData.display_phone_number || 'N/A'}
Status: ${phoneData.status || 'N/A'}
Verified Name: ${phoneData.verified_name || 'N/A'}
Code Verification Status: ${phoneData.code_verification_status || 'N/A'}
Quality Rating: ${phoneData.quality_rating || 'N/A'}
Platform: ${phoneData.platform || 'N/A'}
Throughput: ${JSON.stringify(phoneData.throughput || {}, null, 2)}
Certificate: ${phoneData.certificate || 'N/A'}
Name Status: ${phoneData.name_status || 'N/A'}
New Name Status: ${phoneData.new_name_status || 'N/A'}

Last Updated: ${new Date().toISOString()}
        `.trim();

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching phone number details: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

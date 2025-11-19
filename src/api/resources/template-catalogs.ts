// src/api/resources/template-catalogs.ts
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { WhatsAppApiClient } from '../../utils/api-client.js';

export function setupTemplateCatalogsResource(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Resource for list of message templates
  server.resource(
    'message_templates',
    new ResourceTemplate('whatsapp://templates', {
      list: undefined,
    }),
    async uri => {
      try {
        // Call the WhatsApp API to get message templates
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/message_templates`
        );

        // Format the templates list
        const templates = response.data.data;
        let formattedTemplates = 'Message Templates:\n------------------\n';

        if (templates.length === 0) {
          formattedTemplates += 'No templates found.';
        } else {
          templates.forEach((template: any, index: number) => {
            formattedTemplates += `${index + 1}. ${template.name}\n`;
            formattedTemplates += `   Status: ${template.status}\n`;
            formattedTemplates += `   Category: ${template.category}\n`;
            formattedTemplates += `   Language: ${template.language}\n\n`;
          });
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedTemplates,
              mimeType: 'text/plain',
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching message templates: ${error.message}`,
              mimeType: 'text/plain',
            },
          ],
        };
      }
    }
  );

  // Resource for template details
  server.resource(
    'template_details',
    new ResourceTemplate('whatsapp://templates/{template_name}', {
      list: undefined,
    }),
    async (uri, { template_name }) => {
      try {
        // Call the WhatsApp API to get message templates
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/message_templates`,
          {
            params: {
              name: template_name,
            },
          }
        );

        // Find the specific template
        const templates = response.data.data;
        const template = templates.find((t: any) => t.name === template_name);

        if (!template) {
          return {
            contents: [
              {
                uri: uri.href,
                text: `Template "${template_name}" not found.`,
                mimeType: 'text/plain',
              },
            ],
          };
        }

        // Format the template details
        let formattedData = `Template: ${template.name}\n`;
        formattedData += `Status: ${template.status}\n`;
        formattedData += `Category: ${template.category}\n`;
        formattedData += `Language: ${template.language}\n\n`;

        // Components
        formattedData += 'Components:\n';
        template.components.forEach((component: any) => {
          formattedData += `- Type: ${component.type}\n`;
          formattedData += `  Text: ${component.text || 'N/A'}\n`;

          if (component.example) {
            formattedData += `  Example: ${JSON.stringify(component.example)}\n`;
          }

          formattedData += '\n';
        });

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedData,
              mimeType: 'text/plain',
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching template details: ${error.message}`,
              mimeType: 'text/plain',
            },
          ],
        };
      }
    }
  );
}

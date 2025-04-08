// src/api/resources/template-catalogs.ts
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WhatsAppApiClient } from '../../utils/api-client.js';

export function setupTemplateCatalogsResource(server: McpServer, apiClient: WhatsAppApiClient) {
  // Resource for list of message templates
  server.resource(
    "message_templates",
    new ResourceTemplate("whatsapp://templates", {
      list: undefined
    }),
    async (uri) => {
      try {
        // Call the WhatsApp API to get message templates
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/message_templates`
        );
        
        // Format the templates list
        const templates = response.data.data;
        let formattedTemplates = "Message Templates:\n------------------\n";
        
        if (templates.length === 0) {
          formattedTemplates += "No templates found.";
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
              text: formattedTemplates
            }
          ]
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving message templates: ${error.message}`
            }
          ]
        };
      }
    }
  );
  
  // Resource for template details
  server.resource(
    "template_details",
    new ResourceTemplate("whatsapp://templates/{template_name}", {
      list: undefined
    }),
    async (uri, { template_name }) => {
      try {
        // Call the WhatsApp API to get message templates
        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/message_templates`,
          {
            params: {
              name: template_name
            }
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
                text: `Template "${template_name}" not found.`
              }
            ]
          };
        }
        
        // Format the template details
        let formattedTemplate = `Template: ${template.name}\n`;
        formattedTemplate += `Status: ${template.status}\n`;
        formattedTemplate += `Category: ${template.category}\n`;
        formattedTemplate += `Language: ${template.language}\n\n`;
        
        // Components
        formattedTemplate += "Components:\n";
        template.components.forEach((component: any) => {
          formattedTemplate += `- Type: ${component.type}\n`;
          formattedTemplate += `  Text: ${component.text || 'N/A'}\n`;
          
          if (component.example) {
            formattedTemplate += `  Example: ${JSON.stringify(component.example)}\n`;
          }
          
          formattedTemplate += "\n";
        });
        
        return {
          contents: [
            {
              uri: uri.href,
              text: formattedTemplate
            }
          ]
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving template details: ${error.message}`
            }
          ]
        };
      }
    }
  );
}
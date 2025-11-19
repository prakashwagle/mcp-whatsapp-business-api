import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';
import { formatApiError, formatSuccessResponse } from '../utils/error-handler.js';
import { MessageAnalyzer } from '../services/message-analyzer.js';

// Define schema for sending a text message
const SendTextMessageSchema = z.object({
  to: z.string(),
  message: z.string(),
  preview_url: z.boolean().optional(),
});

// Define schema for sending a template message
const TemplateComponentParameterSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('currency'),
    currency: z.object({
      code: z.string(),
      amount_1000: z.number(),
    }),
  }),
  z.object({
    type: z.literal('date_time'),
    date_time: z.object({
      fallback_value: z.string(),
    }),
  }),
]);

const SendTemplateMessageSchema = z.object({
  to: z.string(),
  template_name: z.string(),
  language_code: z.string().default('en_US'),
  components: z
    .array(
      z.object({
        type: z.enum(['header', 'body', 'button']),
        parameters: z.array(TemplateComponentParameterSchema).optional(),
      })
    )
    .optional(),
});

// Define schema for sending a media message
const SendMediaMessageSchema = z.object({
  to: z.string(),
  media_type: z.enum(['image', 'audio', 'document', 'video', 'sticker']),
  media_url: z.string().url(),
  caption: z.string().optional(),
});

// Define schema for marking messages as read
const MarkMessageAsReadSchema = z.object({
  message_id: z.string(),
});

export function setupMessagesTools(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Tool: Send Text Message
  server.tool(
    'whatsapp_send_text_message',
    SendTextMessageSchema.shape,
    async params => {
      try {
        const response = await apiClient.sendMessage({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: 'text',
          text: {
            body: params.message,
            preview_url: params.preview_url || false,
          },
        });

        return formatSuccessResponse(response.data, 'Message sent successfully');
      } catch (error: any) {
        return formatApiError(error, 'sending text message');
      }
    }
  );

  // Tool: Send Template Message
  server.tool(
    'whatsapp_send_template_message',
    SendTemplateMessageSchema.shape,
    async params => {
      try {
        const response = await apiClient.sendMessage({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: 'template',
          template: {
            name: params.template_name,
            language: {
              code: params.language_code,
            },
            components: params.components || [],
          },
        });

        return formatSuccessResponse(response.data, 'Template message sent successfully');
      } catch (error: any) {
        return formatApiError(error, 'sending template message');
      }
    }
  );

  // Tool: Send Media Message
  server.tool(
    'whatsapp_send_media_message',
    SendMediaMessageSchema.shape,
    async params => {
      try {
        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: params.media_type,
          [params.media_type]: {
            link: params.media_url,
            ...(params.caption ? { caption: params.caption } : {}),
          },
        };

        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/messages`,
          payload
        );

        return formatSuccessResponse(response.data, 'Media message sent successfully');
      } catch (error: any) {
        return formatApiError(error, 'sending media message');
      }
    }
  );

  // Tool: Mark Message as Read
  server.tool(
    'whatsapp_mark_message_as_read',
    MarkMessageAsReadSchema.shape,
    async params => {
      try {
        const response = await apiClient.post(
          `${apiClient.getPhoneNumberEndpoint()}/messages`,
          {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: params.message_id,
          }
        );

        return formatSuccessResponse(response.data, 'Message marked as read');
      } catch (error: any) {
        return formatApiError(error, 'marking message as read');
      }
    }
  );

  // Tool: Smart Message Suggestion
  const SmartMessageSuggestionSchema = z.object({
    message_content: z.string(),
    recipient: z.string().optional(),
  });

  server.tool(
    'whatsapp_smart_message_suggestion',
    SmartMessageSuggestionSchema.shape,
    async params => {
      try {
        const { message_content } = params;
        const analyzer = new MessageAnalyzer(apiClient);
        const recommendation = await analyzer.analyzeMessage(message_content);

        return {
          content: [
            {
              type: 'text',
              text: recommendation,
            },
          ],
        };
      } catch (error: any) {
        return formatApiError(error, 'analyzing message');
      }
    }
  );

  // Tool: List Message Templates
  server.tool('whatsapp_list_message_templates', {}, async () => {
    try {
      const response = await apiClient.get(
        `${apiClient.getBusinessAccountEndpoint()}/message_templates`
      );

      return formatSuccessResponse(response.data, 'Available message templates');
    } catch (error: any) {
      return formatApiError(error, 'getting message templates');
    }
  });
}

// src/api/messages.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhatsAppApiClient } from '../utils/api-client.js';

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

        return {
          content: [
            {
              type: 'text',
              text: `Message sent successfully: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error sending text message: ${error.message}`,
            },
          ],
        };
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

        return {
          content: [
            {
              type: 'text',
              text: `Template message sent successfully: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error sending template message: ${error.message}`,
            },
          ],
        };
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

        return {
          content: [
            {
              type: 'text',
              text: `Media message sent successfully: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error sending media message: ${error.message}`,
            },
          ],
        };
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

        return {
          content: [
            {
              type: 'text',
              text: `Message marked as read: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error marking message as read: ${error.message}`,
            },
          ],
        };
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
        
        // Analyze message content for type
        const isPromotional = /\b(coupon|discount|sale|offer|promo|deal|savings|special|limited time|exclusive|free|% off|buy now|shop now|order now)\b/i.test(message_content);
        const isTransactional = /\b(order|receipt|confirmation|delivery|tracking|invoice|payment|appointment|booking|welcome|reset|verify)\b/i.test(message_content);
        const isUrgent = /\b(urgent|immediate|asap|emergency|critical|important|breaking)\b/i.test(message_content);
        
        let recommendation = "**📋 SMART MESSAGING RECOMMENDATION**\n\n";
        let suggestedTool = "";
        let reasoning = "";
        
        if (isPromotional) {
          suggestedTool = "whatsapp_send_template_message";
          reasoning = "🎯 **PROMOTIONAL CONTENT DETECTED**\n\n" +
            "Keywords found: " + (message_content.match(/\b(coupon|discount|sale|offer|promo|deal|savings|special|limited time|exclusive|free|% off|buy now|shop now|order now)\b/gi) || []).join(", ") + "\n\n" +
            "**Why Template Message?**\n" +
            "✅ Required for promotional content\n" +
            "✅ Can reach users outside 24-hour window\n" +
            "✅ Better delivery rates for marketing\n" +
            "✅ WhatsApp compliance\n" +
            "✅ Professional appearance and analytics\n\n";
        } else if (isTransactional) {
          suggestedTool = "whatsapp_send_template_message";
          reasoning = "📋 **TRANSACTIONAL CONTENT DETECTED**\n\n" +
            "Keywords found: " + (message_content.match(/\b(order|receipt|confirmation|delivery|tracking|invoice|payment|appointment|booking|welcome|reset|verify)\b/gi) || []).join(", ") + "\n\n" +
            "**Why Template Message?**\n" +
            "✅ Higher approval rates for transactional content\n" +
            "✅ Better delivery reliability\n" +
            "✅ Can be sent anytime\n" +
            "✅ Professional formatting\n\n";
        } else if (isUrgent) {
          suggestedTool = "whatsapp_send_text_message";
          reasoning = "🚨 **URGENT CONTENT DETECTED**\n\n" +
            "Keywords found: " + (message_content.match(/\b(urgent|immediate|asap|emergency|critical|important|breaking)\b/gi) || []).join(", ") + "\n\n" +
            "**Why Text Message?**\n" +
            "✅ Faster to send (no template lookup)\n" +
            "✅ Immediate delivery\n" +
            "✅ Good for time-sensitive replies\n\n" +
            "⚠️ **Note:** Only works if customer messaged you within 24 hours\n\n";
        } else {
          suggestedTool = "whatsapp_send_text_message OR whatsapp_send_template_message";
          reasoning = "💬 **CONVERSATIONAL CONTENT**\n\n" +
            "**Options:**\n" +
            "1. **Text Message:** If replying within 24-hour window\n" +
            "2. **Template Message:** If business-initiated or outside 24-hour window\n\n";
        }
        
        // Get available templates
        const templatesResponse = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/message_templates`
        );
        
        const templates = templatesResponse.data.data || [];
        const promotionalTemplates = templates.filter((t: any) => 
          t.category === 'MARKETING' || 
          t.name.toLowerCase().includes('promo') ||
          t.name.toLowerCase().includes('offer') ||
          t.name.toLowerCase().includes('discount')
        );
        
        const transactionalTemplates = templates.filter((t: any) => 
          t.category === 'UTILITY' || 
          t.name.toLowerCase().includes('confirm') ||
          t.name.toLowerCase().includes('order') ||
          t.name.toLowerCase().includes('receipt')
        );
        
        let templateSuggestions = "";
        if (isPromotional && promotionalTemplates.length > 0) {
          templateSuggestions = "\n**🎯 AVAILABLE PROMOTIONAL TEMPLATES:**\n" +
            promotionalTemplates.slice(0, 3).map((t: any) => `- ${t.name} (${t.status})`).join("\n") + "\n";
        } else if (isTransactional && transactionalTemplates.length > 0) {
          templateSuggestions = "\n**📋 AVAILABLE TRANSACTIONAL TEMPLATES:**\n" +
            transactionalTemplates.slice(0, 3).map((t: any) => `- ${t.name} (${t.status})`).join("\n") + "\n";
        }
        
        recommendation += reasoning + templateSuggestions;
        
        recommendation += "\n**💡 NEXT STEPS:**\n";
        if (suggestedTool.includes("template")) {
          recommendation += "1. Use `whatsapp_list_message_templates` to see all available templates\n";
          recommendation += "2. Choose appropriate template based on your content\n";
          recommendation += "3. Use `whatsapp_send_template_message` with proper parameters\n";
        } else {
          recommendation += "1. Ensure customer contacted you within last 24 hours\n";
          recommendation += "2. Use `whatsapp_send_text_message` for immediate delivery\n";
          recommendation += "3. If outside 24-hour window, use template instead\n";
        }
        
        recommendation += "\n**📊 For better insights:** Check analytics with `whatsapp://analytics/messaging`";

        return {
          content: [
            {
              type: 'text',
              text: recommendation,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error analyzing message: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: List Message Templates
  server.tool('whatsapp_list_message_templates', {}, async () => {
    try {
      const response = await apiClient.get(
        `${apiClient.getBusinessAccountEndpoint()}/message_templates`
      );

      return {
        content: [
          {
            type: 'text',
            text: `Available message templates: ${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting message templates: ${error.message}`,
          },
        ],
      };
    }
  });
}

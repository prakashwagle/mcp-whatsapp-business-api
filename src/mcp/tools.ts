import { z } from 'zod';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

// Schema definitions for MCP tools
export const updateBusinessProfileSchema = z.object({
  about: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  websites: z.array(z.string().url()).optional(),
  vertical: z.string().optional(),
});

export const sendTextMessageSchema = z.object({
  to: z.string(),
  text: z.string(),
  preview_url: z.boolean().optional(),
});

export const sendTemplateMessageSchema = z.object({
  to: z.string(),
  template_name: z.string(),
  language: z.object({
    code: z.string(),
  }),
  components: z.array(
    z.object({
      type: z.enum(['header', 'body', 'button']),
      parameters: z.array(
        z.object({
          type: z.enum(['text', 'currency', 'date_time', 'image', 'document', 'video']),
          text: z.string().optional(),
          currency: z
            .object({
              code: z.string(),
              amount: z.number(),
            })
            .optional(),
          date_time: z
            .object({
              fallback_value: z.string(),
            })
            .optional(),
          image: z
            .object({
              link: z.string().url(),
            })
            .optional(),
          document: z
            .object({
              link: z.string().url(),
            })
            .optional(),
          video: z
            .object({
              link: z.string().url(),
            })
            .optional(),
        })
      ),
    })
  ).optional(),
});

export const registerPhoneNumberSchema = z.object({
  pin: z.string(),
});

export const setTwoStepVerificationSchema = z.object({
  pin: z.string(),
});

// Tool implementations for MCP
export const updateBusinessProfile = async (params: z.infer<typeof updateBusinessProfileSchema>) => {
  try {
    const result = await whatsappService.updateBusinessProfile(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP tool error: updateBusinessProfile', { error });
    throw error;
  }
};

export const sendTextMessage = async (params: z.infer<typeof sendTextMessageSchema>) => {
  try {
    const result = await whatsappService.sendTextMessage(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP tool error: sendTextMessage', { error });
    throw error;
  }
};

export const sendTemplateMessage = async (params: z.infer<typeof sendTemplateMessageSchema>) => {
  try {
    const result = await whatsappService.sendTemplateMessage(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP tool error: sendTemplateMessage', { error });
    throw error;
  }
};

export const registerPhoneNumber = async (params: z.infer<typeof registerPhoneNumberSchema>) => {
  try {
    const result = await whatsappService.registerPhoneNumber(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP tool error: registerPhoneNumber', { error });
    throw error;
  }
};

export const setTwoStepVerification = async (params: z.infer<typeof setTwoStepVerificationSchema>) => {
  try {
    const result = await whatsappService.setTwoStepVerification(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP tool error: setTwoStepVerification', { error });
    throw error;
  }
};
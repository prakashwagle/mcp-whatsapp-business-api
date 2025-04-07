import { z } from 'zod';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

// Schema definitions for MCP resources
export const businessProfileSchema = z.object({
  about: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  messaging_product: z.literal('whatsapp'),
  vertical: z.enum([
    'UNDEFINED',
    'OTHER',
    'AUTO',
    'BEAUTY',
    'APPAREL',
    'EDU',
    'ENTERTAINMENT',
    'EVENT_PLANNING',
    'FINANCE',
    'GROCERY',
    'GOVT',
    'HOTEL',
    'HEALTH',
    'NONPROFIT',
    'PROFESSIONAL',
    'RETAIL',
    'TRAVEL',
    'RESTAURANT',
    'NOT_A_BIZ'
  ]),
  websites: z.array(z.string().url()).optional(),
  profile_picture_url: z.string().url().optional()
});

export const phoneNumbersSchema = z.object({
  verified_name: z.string(),
  display_phone_number: z.string(),
  id: z.string(),
  quality_rating: z.enum(['GREEN', 'YELLOW', 'RED']),
  code_verification_status: z.enum(['NOT_VERIFIED', 'VERIFIED', 'PENDING']),
  messaging_limit: z.object({
    tier: z.string(),
    current_limit: z.number(),
    max_limit: z.number(),
    remaining_limit: z.number(),
    next_reset_time: z.string().datetime()
  })
});

export const errorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
    code: z.number(),
    error_subcode: z.number().optional(),
    fbtrace_id: z.string()
  })
});

// Types derived from schemas
export type BusinessProfile = z.infer<typeof businessProfileSchema>;
export type PhoneNumber = z.infer<typeof phoneNumbersSchema>;
// export type Message = z.infer<typeof messageSchema>;
// export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Resource implementations for MCP
export const getBusinessProfileResource = async () => {
  try {
    const businessProfile = await whatsappService.getBusinessProfile();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(businessProfile, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP resource error: getBusinessProfile', { error });
    throw error;
  }
};

export const getPhoneNumbersResource = async () => {
  try {
    const phoneNumbers = await whatsappService.getPhoneNumbers();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(phoneNumbers, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('MCP resource error: getPhoneNumbers', { error });
    throw error;
  }
};
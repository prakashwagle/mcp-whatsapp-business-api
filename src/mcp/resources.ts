import { config } from '../config';

export const MCP_RESOURCES = {
  BUSINESS_PROFILE: {
    GET: `/${config.whatsapp.phoneNumberId}/whatsapp_business_profile`,
    UPDATE: `/${config.whatsapp.phoneNumberId}/whatsapp_business_profile`
  },
  MESSAGES: {
    SEND: `/${config.whatsapp.phoneNumberId}/messages`
  },
  PHONE_NUMBERS: {
    LIST: `/${config.whatsapp.businessAccountId}/phone_numbers`
  },
  REGISTRATION: {
    REGISTER: `/${config.whatsapp.phoneNumberId}/register`,
    VERIFY: `/${config.whatsapp.phoneNumberId}/verify`
  }
}; 
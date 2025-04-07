export const MCP_PROMPTS = {
  BUSINESS_PROFILE: {
    GET: 'Retrieve the current business profile settings',
    UPDATE: 'Update the business profile with new information'
  },
  MESSAGES: {
    SEND: 'Send a new message to a WhatsApp user',
    TEMPLATE: 'Send a template message to a WhatsApp user'
  },
  PHONE_NUMBERS: {
    LIST: 'List all registered phone numbers',
    VERIFY: 'Verify a phone number for WhatsApp Business API'
  },
  REGISTRATION: {
    REGISTER: 'Register a new phone number',
    VERIFY: 'Verify a registered phone number'
  }
};

export const ERROR_MESSAGES = {
  INVALID_PHONE: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)',
  INVALID_MESSAGE: 'Invalid message content or type',
  API_ERROR: 'Error communicating with WhatsApp API',
  AUTH_ERROR: 'Authentication failed',
  RATE_LIMIT: 'Rate limit exceeded. Please try again later'
}; 
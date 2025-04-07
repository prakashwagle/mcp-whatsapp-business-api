import { config } from '../config';
import { logger } from '../utils/logger';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add the plus sign if not present
  return digits.startsWith('+') ? digits : `+${digits}`;
};

export const validateMessageContent = (content: string, type: string): boolean => {
  switch (type) {
    case 'text':
      return content.length <= 4096;
    case 'image':
    case 'video':
    case 'document':
      return content.startsWith('http') || content.startsWith('https');
    default:
      return true;
  }
};

export const handleApiError = (error: any): never => {
  logger.error('API Error:', error);
  throw new Error(error.response?.data?.error?.message || error.message);
}; 
import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

export const getPhoneNumbers = async (req: Request, res: Response) => {
  try {
    const phoneNumbers = await whatsappService.getPhoneNumbers();
    
    return res.status(200).json({
      success: true,
      data: phoneNumbers
    });
  } catch (error: any) {
    logger.error('Error getting phone numbers', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};
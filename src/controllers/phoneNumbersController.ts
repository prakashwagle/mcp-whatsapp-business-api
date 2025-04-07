import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsappService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const whatsappService = new WhatsAppService();

export const getPhoneNumbers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const phoneNumbers = await whatsappService.getPhoneNumbers();
    res.json(phoneNumbers);
  } catch (error) {
    logger.error('Error getting phone numbers:', error);
    next(new AppError(500, 'Failed to get phone numbers'));
  }
};

export const getPhoneNumberDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumberId } = req.params;
    // Implementation will be added later
    res.json({ id: phoneNumberId, status: 'active' });
  } catch (error) {
    logger.error('Error getting phone number details:', error);
    next(new AppError(500, 'Failed to get phone number details'));
  }
}; 
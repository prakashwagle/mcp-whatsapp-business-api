import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsappService';
import { RegistrationRequest, VerificationRequest } from '../models/registration';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const whatsappService = new WhatsAppService();

export const registerPhoneNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request: RegistrationRequest = req.body;
    const result = await whatsappService.registerPhoneNumber(request);
    res.json(result);
  } catch (error) {
    logger.error('Error registering phone number:', error);
    next(new AppError(500, 'Failed to register phone number'));
  }
};

export const verifyPhoneNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request: VerificationRequest = req.body;
    const result = await whatsappService.verifyPhoneNumber(request);
    res.json(result);
  } catch (error) {
    logger.error('Error verifying phone number:', error);
    next(new AppError(500, 'Failed to verify phone number'));
  }
}; 
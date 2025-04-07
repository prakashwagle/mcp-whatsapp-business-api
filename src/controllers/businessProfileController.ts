import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsappService';
import { BusinessProfileUpdate } from '../models/businessProfile';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const whatsappService = new WhatsAppService();

export const getBusinessProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await whatsappService.getBusinessProfile();
    res.json(profile);
  } catch (error) {
    logger.error('Error getting business profile:', error);
    next(new AppError(500, 'Failed to get business profile'));
  }
};

export const updateBusinessProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update: BusinessProfileUpdate = req.body;
    const profile = await whatsappService.updateBusinessProfile(update);
    res.json(profile);
  } catch (error) {
    logger.error('Error updating business profile:', error);
    next(new AppError(500, 'Failed to update business profile'));
  }
}; 
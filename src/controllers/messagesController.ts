import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsappService';
import { MessageSendRequest } from '../models/message';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const whatsappService = new WhatsAppService();

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request: MessageSendRequest = req.body;
    const result = await whatsappService.sendMessage(request);
    res.json(result);
  } catch (error) {
    logger.error('Error sending message:', error);
    next(new AppError(500, 'Failed to send message'));
  }
};

export const getMessageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId } = req.params;
    // Implementation will be added later
    res.json({ status: 'pending' });
  } catch (error) {
    logger.error('Error getting message status:', error);
    next(new AppError(500, 'Failed to get message status'));
  }
}; 
import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

export const setTwoStepVerification = async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    
    if (!pin) {
      return res.status(400).json({
        success: false,
        error: 'Pin is required'
      });
    }
    
    const result = await whatsappService.setTwoStepVerification({ pin });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error setting two-step verification', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};
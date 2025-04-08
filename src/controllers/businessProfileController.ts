import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

export const getBusinessProfile = async (req: Request, res: Response) => {
  try {
    const businessProfile = await whatsappService.getBusinessProfile();
    
    return res.status(200).json({
      success: true,
      data: businessProfile
    });
  } catch (error: any) {
    logger.error('Error getting business profile', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

export const updateBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { about, address, description, email, websites, vertical } = req.body;
    
    const updatedProfile = await whatsappService.updateBusinessProfile({
      about,
      address,
      description,
      email,
      websites,
      vertical
    });
    
    return res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error: any) {
    logger.error('Error updating business profile', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};
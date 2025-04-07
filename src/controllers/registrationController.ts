import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

export const registerPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    
    if (!pin) {
      return res.status(400).json({
        success: false,
        error: 'Pin is required'
      });
    }
    
    const registrationResult = await whatsappService.registerPhoneNumber({ pin });
    
    return res.status(200).json({
      success: true,
      data: registrationResult
    });
  } catch (error: any) {
    logger.error('Error registering phone number', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

export const deregisterPhoneNumber = async (req: Request, res: Response) => {
  try {
    const deregistrationResult = await whatsappService.deregisterPhoneNumber();
    
    return res.status(200).json({
      success: true,
      data: deregistrationResult
    });
  } catch (error: any) {
    logger.error('Error deregistering phone number', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

export const requestVerificationCode = async (req: Request, res: Response) => {
  try {
    const { code_method, locale } = req.body;
    
    if (!code_method) {
      return res.status(400).json({
        success: false,
        error: 'Code method is required'
      });
    }
    
    const result = await whatsappService.requestVerificationCode({ 
      code_method: code_method as 'SMS' | 'VOICE',
      locale 
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error requesting verification code', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }
    
    const result = await whatsappService.verifyCode({ code });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error verifying code', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};
import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import logger from '../utils/logger';

export const sendTextMessage = async (req: Request, res: Response) => {
  try {
    const { to, text, preview_url } = req.body;
    
    if (!to || !text) {
      return res.status(400).json({
        success: false,
        error: 'To and text fields are required'
      });
    }
    
    const result = await whatsappService.sendTextMessage({
      to,
      text,
      preview_url
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error sending text message', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

export const sendTemplateMessage = async (req: Request, res: Response) => {
  try {
    const { to, template_name, language, components } = req.body;
    
    if (!to || !template_name || !language || !language.code) {
      return res.status(400).json({
        success: false,
        error: 'To, template_name, and language.code fields are required'
      });
    }
    
    const result = await whatsappService.sendTemplateMessage({
      to,
      template_name,
      language,
      components
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error sending template message', { error: error.message });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};
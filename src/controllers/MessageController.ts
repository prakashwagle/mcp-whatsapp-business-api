import { Request, Response } from 'express';
import { WhatsAppService } from '../services/WhatsAppService';
import { WhatsAppMessage } from '../models/Message';

export class MessageController {
  private whatsappService: WhatsAppService;

  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const message: WhatsAppMessage = req.body;
      const result = await this.whatsappService.sendMessage(message);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getMessageStatus(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const status = await this.whatsappService.getMessageStatus(messageId);
      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}

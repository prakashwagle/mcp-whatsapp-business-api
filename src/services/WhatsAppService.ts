import axios from 'axios';
import { WhatsAppMessage, MessageStatus } from '../models/Message';

export class WhatsAppService {
  private apiUrl: string;
  private accessToken: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  }

  async sendMessage(message: WhatsAppMessage): Promise<MessageStatus> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        messageId: response.data.messages[0].id,
        status: 'sent',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        messageId: '',
        status: 'failed',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        messageId,
        status: response.data.status,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        messageId,
        status: 'failed',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

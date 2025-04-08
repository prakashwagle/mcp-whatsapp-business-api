import httpClient from '../utils/httpClient';
import config from '../config';
import logger from '../utils/logger';

class WhatsAppService {
  private phoneNumberId: string;

  constructor() {
    this.phoneNumberId = config.whatsapp.phoneNumberId;
  }

  // Business Profiles API

  /**
   * Get business profile information
   */
  async getBusinessProfile() {
    try {
      const response = await httpClient.get(`/${this.phoneNumberId}/whatsapp_business_profile`);
      return response.data;
    } catch (error) {
      logger.error('Error getting business profile', { error });
      throw error;
    }
  }

  /**
   * Update business profile information
   */
  async updateBusinessProfile(data: {
    about?: string;
    address?: string;
    description?: string;
    email?: string;
    websites?: string[];
    vertical?: string;
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/whatsapp_business_profile`, {
        messaging_product: "whatsapp",
        ...data
      });
      return response.data;
    } catch (error) {
      logger.error('Error updating business profile', { error });
      throw error;
    }
  }

  // Registration API

  /**
   * Register a phone number
   */
  async registerPhoneNumber(data: {
    pin: string;
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/register`, {
        messaging_product: "whatsapp",
        ...data
      });
      return response.data;
    } catch (error) {
      logger.error('Error registering phone number', { error });
      throw error;
    }
  }

  /**
   * Deregister a phone number
   */
  async deregisterPhoneNumber() {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/deregister`, {
        messaging_product: "whatsapp"
      });
      return response.data;
    } catch (error) {
      logger.error('Error deregistering phone number', { error });
      throw error;
    }
  }

  // Messages API

  /**
   * Send a text message
   */
  async sendTextMessage(data: {
    to: string;
    text: string;
    preview_url?: boolean;
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: data.to,
        type: "text",
        text: {
          body: data.text,
          preview_url: data.preview_url
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error sending text message', { error });
      throw error;
    }
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(data: {
    to: string;
    template_name: string;
    language: {
      code: string;
    };
    components?: any[];
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: data.to,
        type: "template",
        template: {
          name: data.template_name,
          language: data.language,
          components: data.components
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error sending template message', { error });
      throw error;
    }
  }

  // Phone Numbers API

  /**
   * Get phone numbers
   */
  async getPhoneNumbers() {
    try {
      const businessAccountId = config.whatsapp.businessAccountId;
      const response = await httpClient.get(`/${businessAccountId}/phone_numbers`);
      return response.data;
    } catch (error) {
      logger.error('Error getting phone numbers', { error });
      throw error;
    }
  }

  /**
   * Request verification code
   */
  async requestVerificationCode(data: {
    code_method: 'SMS' | 'VOICE';
    locale?: string;
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/request_code`, {
        ...data
      });
      return response.data;
    } catch (error) {
      logger.error('Error requesting verification code', { error });
      throw error;
    }
  }

  /**
   * Verify code
   */
  async verifyCode(data: {
    code: string;
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/verify_code`, {
        ...data
      });
      return response.data;
    } catch (error) {
      logger.error('Error verifying code', { error });
      throw error;
    }
  }

  // Two-Step Verification API

  /**
   * Set two-step verification
   */
  async setTwoStepVerification(data: {
    pin: string;
  }) {
    try {
      const response = await httpClient.post(`/${this.phoneNumberId}/two_step`, {
        ...data
      });
      return response.data;
    } catch (error) {
      logger.error('Error setting two-step verification', { error });
      throw error;
    }
  }
}

export default new WhatsAppService();
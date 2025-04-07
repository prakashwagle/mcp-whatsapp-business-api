import { config } from '../config';
import { HttpClient } from '../utils/httpClient';
import { logger } from '../utils/logger';
import { BusinessProfile, BusinessProfileUpdate } from '../models/businessProfile';
import { Message, MessageSendRequest } from '../models/message';
import { PhoneNumber } from '../models/phoneNumber';
import { Registration, RegistrationRequest, VerificationRequest } from '../models/registration';

export class WhatsAppService {
  private client: HttpClient;
  private phoneNumberId: string;

  constructor() {
    this.client = new HttpClient();
    this.phoneNumberId = config.whatsapp.phoneNumberId;
  }

  // Business Profile Methods
  async getBusinessProfile(): Promise<BusinessProfile> {
    const url = `/${this.phoneNumberId}/whatsapp_business_profile`;
    return this.client.get<BusinessProfile>(url);
  }

  async updateBusinessProfile(update: BusinessProfileUpdate): Promise<BusinessProfile> {
    const url = `/${this.phoneNumberId}/whatsapp_business_profile`;
    return this.client.post<BusinessProfile>(url, update);
  }

  // Message Methods
  async sendMessage(request: MessageSendRequest): Promise<Message> {
    const url = `/${this.phoneNumberId}/messages`;
    return this.client.post<Message>(url, {
      messaging_product: 'whatsapp',
      to: request.to,
      type: request.type,
      [request.type]: {
        [request.type === 'text' ? 'body' : 'link']: request.content
      }
    });
  }

  // Phone Number Methods
  async getPhoneNumbers(): Promise<PhoneNumber[]> {
    const url = `/${config.whatsapp.businessAccountId}/phone_numbers`;
    return this.client.get<PhoneNumber[]>(url);
  }

  // Registration Methods
  async registerPhoneNumber(request: RegistrationRequest): Promise<Registration> {
    const url = `/${this.phoneNumberId}/register`;
    return this.client.post<Registration>(url, request);
  }

  async verifyPhoneNumber(request: VerificationRequest): Promise<Registration> {
    const url = `/${this.phoneNumberId}/verify`;
    return this.client.post<Registration>(url, request);
  }
} 
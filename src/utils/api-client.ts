// WhatsApp API client utilities
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Config } from './config.js';
import { WhatsAppResponse } from '../types/whatsapp.js';
import { eventEmitter } from './event-emitter.js';

export class WhatsAppApiClient {
  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${config.whatsappApiVersion}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.whatsappAccessToken}`,
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(async request => {
      const startTime = Date.now();
      (request as any).metadata = { startTime };
      console.log(`Request to ${request.url}`, request.data || {});
      return request;
    });

    // Add response interceptor for logging, metrics, and error handling
    this.client.interceptors.response.use(
      response => {
        const endTime = Date.now();
        const startTime =
          (response.config as any).metadata?.startTime || endTime;
        const responseTime = endTime - startTime;

        eventEmitter.emitApiCall(
          response.config.url || '',
          response.config.method?.toUpperCase() || '',
          responseTime
        );

        return response;
      },
      error => {
        console.error('API Error:', error.response?.data || error.message);

        const endTime = Date.now();
        const startTime = (error.config as any)?.metadata?.startTime || endTime;
        const responseTime = endTime - startTime;

        eventEmitter.emitApiCall(
          error.config?.url || '',
          error.config?.method?.toUpperCase() || '',
          responseTime
        );

        eventEmitter.emitError(error, 'api_request');

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<WhatsAppResponse<T>>> {
    return this.client.get(endpoint, config);
  }

  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<WhatsAppResponse<T>>> {
    return this.client.post(endpoint, data, config);
  }

  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<WhatsAppResponse<T>>> {
    return this.client.patch(endpoint, data, config);
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<WhatsAppResponse<T>>> {
    return this.client.delete(endpoint, config);
  }

  // Special method for sending messages with event tracking
  async sendMessage(data: any): Promise<AxiosResponse<WhatsAppResponse>> {
    const endpoint = `${this.getPhoneNumberEndpoint()}/messages`;

    try {
      const response = await this.post(endpoint, data);
      eventEmitter.emitMessageSent(
        response.data.messages?.[0]?.id || 'unknown',
        this.config.whatsappPhoneNumberId,
        data
      );
      return response;
    } catch (error) {
      eventEmitter.emitMessageFailed(
        error,
        this.config.whatsappPhoneNumberId,
        data
      );
      throw error;
    }
  }

  // Helper method to get phone number endpoint
  getPhoneNumberEndpoint() {
    return `/${this.config.whatsappPhoneNumberId}`;
  }

  // Helper method to get business account endpoint
  getBusinessAccountEndpoint() {
    return `/${this.config.whatsappBusinessAccountId}`;
  }
}

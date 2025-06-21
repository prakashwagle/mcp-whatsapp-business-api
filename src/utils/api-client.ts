// WhatsApp API client utilities
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Config } from './config.js';
import { rateLimiter } from './rate-limiter.js';
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

    // Add request interceptor for logging and rate limiting
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

  async get(path: string, config?: AxiosRequestConfig) {
    return rateLimiter.scheduleApiCall(
      path,
      () => this.client.get(path, config),
      this.config.whatsappBusinessAccountId
    );
  }

  async post(path: string, data: any, config?: AxiosRequestConfig) {
    return rateLimiter.scheduleApiCall(
      path,
      () => this.client.post(path, data, config),
      this.config.whatsappBusinessAccountId
    );
  }

  async patch(path: string, data: any, config?: AxiosRequestConfig) {
    return rateLimiter.scheduleApiCall(
      path,
      () => this.client.patch(path, data, config),
      this.config.whatsappBusinessAccountId
    );
  }

  async delete(path: string, config?: AxiosRequestConfig) {
    return rateLimiter.scheduleApiCall(
      path,
      () => this.client.delete(path, config),
      this.config.whatsappBusinessAccountId
    );
  }

  // Special method for sending messages with proper rate limiting
  async sendMessage(data: any, isTemplate: boolean = false) {
    const path = `${this.getPhoneNumberEndpoint()}/messages`;

    return rateLimiter.scheduleMessage(
      this.config.whatsappPhoneNumberId,
      async () => {
        try {
          const response = await this.client.post(path, data);
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
      },
      isTemplate
    );
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

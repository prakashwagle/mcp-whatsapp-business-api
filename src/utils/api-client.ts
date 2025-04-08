// WhatsApp API client utilities 
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Config } from './config.js';

export class WhatsAppApiClient {
  private client: AxiosInstance;
  private config: Config;
  
  constructor(config: Config) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${config.whatsappApiVersion}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.whatsappAccessToken}`
      }
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use((request) => {
      console.log(`Request to ${request.url}`, request.data || {});
      return request;
    });
    
    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  async get(path: string, config?: AxiosRequestConfig) {
    return this.client.get(path, config);
  }
  
  async post(path: string, data: any, config?: AxiosRequestConfig) {
    return this.client.post(path, data, config);
  }
  
  async patch(path: string, data: any, config?: AxiosRequestConfig) {
    return this.client.patch(path, data, config);
  }
  
  async delete(path: string, config?: AxiosRequestConfig) {
    return this.client.delete(path, config);
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
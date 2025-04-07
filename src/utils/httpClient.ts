import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from './logger';

export class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.whatsapp.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.whatsapp.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Making request to ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Received response from ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
} 
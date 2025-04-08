import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';

class HttpClient {
  private client: AxiosInstance;
  private samplingRate: number = 0.5; // 50% sampling rate
  
  constructor() {
    // Create Axios instance with default configuration
    this.client = axios.create({
      baseURL: `${config.whatsapp.apiBaseUrl}/${config.whatsapp.apiVersion}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.whatsapp.accessToken}`,
      },
      timeout: 30000, // 30 seconds timeout
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use((config) => {
      if (this.shouldSampleLog()) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    });
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[API Error]', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  // GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }
  
  // POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }
  
  // PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }
  
  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
  
  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  private shouldSampleLog(): boolean {
    return Math.random() < this.samplingRate;
  }
}

// Export a singleton instance
export default new HttpClient();
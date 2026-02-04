import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired, trigger logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(this.formatError(error));
      }
    );

    // Load token from storage
    const stored = localStorage.getItem('cabinia-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        this.token = state?.token || null;
      } catch {
        // Invalid storage
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private formatError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
    };
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
}

export const api = new ApiClient();

import axios from 'axios';
import { getToken, removeToken } from '@/lib/auth/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setupInterceptors(client: ReturnType<typeof axios.create>) {
  client.interceptors.request.use(
    (config) => {
      // Tự động gắn Bearer token cho các request sau khi đăng nhập.
      const token = getToken();
      if (token?.accessToken) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token.accessToken}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token hết hạn hoặc không hợp lệ thì xóa phiên và quay về login.
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

setupInterceptors(apiClient);

export { apiClient };

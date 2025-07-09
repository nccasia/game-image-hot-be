import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import camelize from 'camelize';

export async function fetchUserServerApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<T> {
  const config: AxiosRequestConfig = {
    method,
    url: endpoint,
    data: body,
    headers,
  };

  return helperInstance(config);
}

// Axios instance
const helperInstance = axios.create({
  baseURL: process.env.USER_SERVER_URL,
  timeout: 10000,
});

// Request interceptor
helperInstance.interceptors.request.use(
  (config) => Promise.resolve(config),
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
helperInstance.interceptors.response.use(
  (response: AxiosResponse) => camelize(response.data),
  (error: AxiosError) => {
    console.error(error);

    if (error.response) {
      return Promise.reject(error.response);
    } else if (error.request) {
      return Promise.reject(error.request);
    } else {
      return Promise.reject(error.message);
    }
  }
);

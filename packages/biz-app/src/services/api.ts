import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { merge } from 'lodash-es';
import { getToken } from '@/_utils/_local-storage';

function createInstance() {
  const instance = axios.create();
  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
  );
  instance.interceptors.response.use(
    (response) => {
      if (response.config.responseType === 'blob') {
        return {
          data: response.data,
          headers: response.headers,
        };
      }
      return {
        body: response.data?.data,
        message: response.data.errorMsg ?? response.data.msg,
        success:
          response.data.errorCode === null ||
          response.data.errorCode === '000000' ||
          response.data.success,
        ...response.data,
      };
    },
    (error) => {
      console.error('API Error:', error);
      return { success: false, error, code: error.response?.data.code };
    },
  );
  return instance;
}

function createRequest(instance: AxiosInstance) {
  return <T>(config: AxiosRequestConfig): Promise<T> => {
    const token = getToken();
    const defaultConfig: AxiosRequestConfig = {
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
      },
      data: {},
      timeout: 5000,
      withCredentials: false,
    };
    const mergeConfig = merge(defaultConfig, config);
    return instance(mergeConfig) as Promise<T>;
  };
}

const instance = createInstance();
const apiClient = createRequest(instance);

export default apiClient;

/**
 * Axios Interceptor for Request/Response Logging
 * Attaches to all axios instances to provide comprehensive logging
 */

import { networkLogger, apiLogger } from './logger';

/**
 * Setup request interceptor
 */
export const setupRequestInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Generate unique request ID
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      config.requestId = requestId;

      // Log the request
      networkLogger.logRequest(
        config.method?.toUpperCase(),
        `${config.baseURL || ''}${config.url}`,
        config.data,
        config.headers
      );

      apiLogger.debug(
        `Request initialized`,
        {
          requestId,
          method: config.method,
          endpoint: config.url,
          hasData: !!config.data,
          timeout: config.timeout,
        }
      );

      return config;
    },
    (error) => {
      apiLogger.error('Request setup error', error);
      return Promise.reject(error);
    }
  );
};

/**
 * Setup response interceptor
 */
export const setupResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      const { config, status, statusText, headers, data } = response;
      const requestId = config.requestId;

      // Log successful response
      networkLogger.logResponse(requestId, status, data, headers);

      apiLogger.info(
        `Response received successfully`,
        {
          requestId,
          status,
          statusText,
          endpoint: config.url,
          method: config.method,
          dataSize: JSON.stringify(data).length,
        }
      );

      return response;
    },
    (error) => {
      const { config, response, message } = error;
      const requestId = config?.requestId || 'UNKNOWN';
      const status = response?.status || 0;
      const errorMessage = response?.data?.message || message || 'Unknown error';

      // Log error response
      networkLogger.logError(requestId, status, error, errorMessage);

      apiLogger.error(
        `API request failed`,
        {
          requestId,
          status,
          endpoint: config?.url,
          method: config?.method,
          errorMessage,
          errorData: response?.data,
        }
      );

      // Add more context to the error
      error.requestId = requestId;
      error.timestamp = new Date().toISOString();

      return Promise.reject(error);
    }
  );
};

/**
 * Setup all interceptors for an axios instance
 */
export const setupAxiosInterceptors = (axiosInstance) => {
  setupRequestInterceptor(axiosInstance);
  setupResponseInterceptor(axiosInstance);

  apiLogger.info('Axios interceptors setup completed');

  return axiosInstance;
};

export default setupAxiosInterceptors;


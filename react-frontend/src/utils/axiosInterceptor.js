/**
 * Axios Interceptor for Request/Response Logging
 * Attaches to all axios instances to provide comprehensive logging
 */

import { networkLogger, apiLogger } from './logger';

// Store current auth token globally for all axios instances
let currentAuthToken = localStorage.getItem('token') || '';

/**
 * Set the authorization token globally
 * Called from AuthContext when token changes
 */
export const setAuthToken = (token) => {
  currentAuthToken = token || '';
  if (token) {
    localStorage.setItem('token', token);
    apiLogger.debug('Auth token updated', { hasToken: !!token });
  } else {
    localStorage.removeItem('token');
    apiLogger.debug('Auth token cleared');
  }
};

/**
 * Get current auth token
 */
export const getAuthToken = () => currentAuthToken;

/**
 * Setup request interceptor
 */
export const setupRequestInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Generate unique request ID
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      config.requestId = requestId;

      // Add authorization header if token exists
      if (currentAuthToken) {
        config.headers.Authorization = `Bearer ${currentAuthToken}`;
        apiLogger.debug('Auth header added', { requestId, hasToken: true });
      } else {
        apiLogger.debug('No auth token available', { requestId });
      }

      // Log the request (excluding sensitive auth header details)
      const headersForLog = { ...config.headers };
      if (headersForLog.Authorization) {
        headersForLog.Authorization = '[REDACTED]';
      }

      networkLogger.logRequest(
        config.method?.toUpperCase(),
        `${config.baseURL || ''}${config.url}`,
        config.data,
        headersForLog
      );

      apiLogger.debug(
        `Request initialized`,
        {
          requestId,
          method: config.method,
          endpoint: config.url,
          hasData: !!config.data,
          hasAuth: !!currentAuthToken,
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

      // Handle 401 Unauthorized specifically
      if (status === 401) {
        apiLogger.warn(
          `🔐 Unauthorized Access - Check Authentication`,
          {
            requestId,
            endpoint: config?.url,
            method: config?.method,
            reason: 'Bearer token missing, invalid, or expired',
            hasToken: !!currentAuthToken,
            tokenLength: currentAuthToken?.length || 0,
            errorMessage,
          }
        );

        // Clear invalid token
        if (currentAuthToken) {
          apiLogger.info('Clearing invalid token from 401 response');
          setAuthToken('');
        }
      } else {
        // Log other error responses
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
            hasAuth: !!currentAuthToken,
          }
        );
      }

      // Add more context to the error
      error.requestId = requestId;
      error.timestamp = new Date().toISOString();
      error.authStatus = {
        hasToken: !!currentAuthToken,
        status: status,
        message: errorMessage,
      };

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


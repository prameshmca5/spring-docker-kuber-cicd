/**
 * Centralized Logger Utility for React Frontend
 * Provides detailed logging for API requests, responses, and application events
 */

const LOG_LEVELS = {
  DEBUG: { level: 0, color: '#888888', label: 'DEBUG' },
  INFO: { level: 1, color: '#0066cc', label: 'INFO' },
  WARN: { level: 2, color: '#ff9900', label: 'WARN' },
  ERROR: { level: 3, color: '#cc0000', label: 'ERROR' },
};

const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG; // Set to DEBUG to see all logs

class Logger {
  constructor(module = 'App') {
    this.module = module;
    this.requestCount = 0;
    this.responseCount = 0;
    this.errorCount = 0;
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString().split('T')[1];
  }

  /**
   * Get formatted message
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${level.label}] [${this.module}]`;

    if (data) {
      return { prefix, message, data };
    }
    return { prefix, message };
  }

  /**
   * Log to console with styling
   */
  logToConsole(level, prefix, message, data = null) {
    const style = `color: ${level.color}; font-weight: bold; font-size: 12px;`;

    if (data) {
      console.log(
        `%c${prefix}`,
        style,
        message,
        data
      );
    } else {
      console.log(`%c${prefix}`, style, message);
    }
  }

  /**
   * Send logs to server (optional - for backend analysis)
   */
  sendToServer(level, message, data) {
    // Implement this if you want to send logs to your backend
    // For now, keeping it client-side only
  }

  /**
   * DEBUG level logging
   */
  debug(message, data = null) {
    if (CURRENT_LOG_LEVEL.level <= LOG_LEVELS.DEBUG.level) {
      const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
      this.logToConsole(LOG_LEVELS.DEBUG, formatted.prefix, formatted.message, formatted.data);
    }
  }

  /**
   * INFO level logging
   */
  info(message, data = null) {
    if (CURRENT_LOG_LEVEL.level <= LOG_LEVELS.INFO.level) {
      const formatted = this.formatMessage(LOG_LEVELS.INFO, message, data);
      this.logToConsole(LOG_LEVELS.INFO, formatted.prefix, formatted.message, formatted.data);
    }
  }

  /**
   * WARN level logging
   */
  warn(message, data = null) {
    if (CURRENT_LOG_LEVEL.level <= LOG_LEVELS.WARN.level) {
      const formatted = this.formatMessage(LOG_LEVELS.WARN, message, data);
      this.logToConsole(LOG_LEVELS.WARN, formatted.prefix, formatted.message, formatted.data);
    }
  }

  /**
   * ERROR level logging
   */
  error(message, data = null) {
    if (CURRENT_LOG_LEVEL.level <= LOG_LEVELS.ERROR.level) {
      const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, data);
      this.logToConsole(LOG_LEVELS.ERROR, formatted.prefix, formatted.message, formatted.data);
      this.errorCount++;
    }
  }

  /**
   * Log API Request
   */
  logRequest(method, url, data = null, headers = null) {
    this.requestCount++;
    const requestLog = {
      id: `REQ-${this.requestCount}`,
      method,
      url,
      timestamp: this.getTimestamp(),
      headers: this.sanitizeHeaders(headers),
      body: data ? JSON.stringify(data) : 'No body',
    };

    console.group(`%c📤 REQUEST [${requestLog.id}]`, 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.log('%cMethod:', 'font-weight: bold;', method);
    console.log('%cURL:', 'font-weight: bold;', url);
    console.log('%cTimestamp:', 'font-weight: bold;', requestLog.timestamp);
    if (headers) {
      console.log('%cHeaders:', 'font-weight: bold;', requestLog.headers);
    }
    if (data) {
      console.log('%cBody:', 'font-weight: bold;', data);
    }
    console.groupEnd();

    return requestLog.id;
  }

  /**
   * Log API Response
   */
  logResponse(requestId, status, data, headers = null) {
    this.responseCount++;
    const responseLog = {
      id: `RES-${this.responseCount}`,
      requestId,
      status,
      statusText: this.getStatusText(status),
      timestamp: this.getTimestamp(),
      headers: this.sanitizeHeaders(headers),
      body: data,
    };

    const statusColor = status >= 400 ? '#cc0000' : '#00cc00';
    console.group(
      `%c📥 RESPONSE [${responseLog.id}] - ${responseLog.requestId}`,
      `color: ${statusColor}; font-weight: bold; font-size: 13px;`
    );
    console.log('%cStatus:', 'font-weight: bold;', `${status} ${responseLog.statusText}`);
    console.log('%cTimestamp:', 'font-weight: bold;', responseLog.timestamp);
    if (headers) {
      console.log('%cHeaders:', 'font-weight: bold;', responseLog.headers);
    }
    console.log('%cBody:', 'font-weight: bold;', data);
    console.groupEnd();

    return responseLog.id;
  }

  /**
   * Log API Error
   */
  logError(requestId, status, error, message = '') {
    this.errorCount++;
    const errorLog = {
      id: `ERR-${this.errorCount}`,
      requestId,
      status,
      statusText: this.getStatusText(status),
      timestamp: this.getTimestamp(),
      message,
      error: error?.response?.data || error?.message || error,
    };

    console.group(
      `%c❌ ERROR [${errorLog.id}] - ${errorLog.requestId}`,
      'color: #cc0000; font-weight: bold; font-size: 13px;'
    );
    console.log('%cStatus:', 'font-weight: bold;', `${status} ${errorLog.statusText}`);
    console.log('%cTimestamp:', 'font-weight: bold;', errorLog.timestamp);
    console.log('%cMessage:', 'font-weight: bold;', message);
    console.log('%cError Details:', 'font-weight: bold;', errorLog.error);
    console.groupEnd();

    return errorLog.id;
  }

  /**
   * Get HTTP status text
   */
  getStatusText(status) {
    const statusTexts = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return statusTexts[status] || 'Unknown';
  }

  /**
   * Sanitize headers to remove sensitive data
   */
  sanitizeHeaders(headers) {
    if (!headers) return null;
    const sanitized = { ...headers };
    const sensitiveKeys = ['authorization', 'cookie', 'x-auth-token', 'password'];

    sensitiveKeys.forEach(key => {
      Object.keys(sanitized).forEach(k => {
        if (k.toLowerCase() === key && sanitized[k]) {
          sanitized[k] = '***REDACTED***';
        }
      });
    });

    return sanitized;
  }

  /**
   * Log page navigation
   */
  logNavigation(from, to) {
    console.log(
      `%c🔀 NAVIGATION`,
      'color: #9933cc; font-weight: bold; font-size: 12px;',
      `${from} → ${to}`
    );
  }

  /**
   * Log component lifecycle
   */
  logComponentMount(componentName) {
    this.debug(`Component mounted: ${componentName}`);
  }

  logComponentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      requests: this.requestCount,
      responses: this.responseCount,
      errors: this.errorCount,
      successRate: this.responseCount > 0 ?
        ((this.responseCount - this.errorCount) / this.responseCount * 100).toFixed(2) + '%' :
        'N/A',
    };
  }

  /**
   * Print statistics
   */
  printStats() {
    const stats = this.getStats();
    console.group('%c📊 STATISTICS', 'color: #0066cc; font-weight: bold; font-size: 12px;');
    console.table(stats);
    console.groupEnd();
  }

  /**
   * Clear all logs
   */
  clear() {
    console.clear();
    this.requestCount = 0;
    this.responseCount = 0;
    this.errorCount = 0;
  }
}

/**
 * Export singleton instances for different modules
 */
export const appLogger = new Logger('App');
export const apiLogger = new Logger('API');
export const authLogger = new Logger('Auth');
export const componentLogger = new Logger('Components');
export const networkLogger = new Logger('Network');

export default Logger;


/**
 * Kubernetes Debugging Helper for React Frontend
 * Provides utilities to diagnose connectivity and service issues
 */

import { appLogger, apiLogger, networkLogger } from './logger';

export const debugHelper = {
  /**
   * Test API connectivity
   */
  testConnectivity: async () => {
    appLogger.info('🔍 Starting API Connectivity Test...');

    const tests = {
      apiGateway: '/api/v1/health',
      accounts: '/api/v1/accounts',
      employees: '/api/v1/employees',
      transactions: '/api/v1/transactions',
    };

    const results = {};

    for (const [service, endpoint] of Object.entries(tests)) {
      try {
        const response = await fetch(endpoint, {
          method: 'HEAD',
          timeout: 5000
        });
        results[service] = {
          status: response.status,
          ok: response.ok,
          message: 'Connected',
          timestamp: new Date().toISOString(),
        };
        appLogger.info(`✅ ${service} is reachable`, results[service]);
      } catch (error) {
        results[service] = {
          status: 0,
          ok: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        };
        appLogger.error(`❌ ${service} is NOT reachable`, results[service]);
      }
    }

    console.group('%c📊 Connectivity Test Results', 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.table(results);
    console.groupEnd();

    return results;
  },

  /**
   * Get environment information
   */
  getEnvironmentInfo: () => {
    const info = {
      'Browser': navigator.userAgent,
      'Current URL': window.location.href,
      'API Base URL': window.location.origin + '/api',
      'Timestamp': new Date().toISOString(),
      'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'Language': navigator.language,
      'Online': navigator.onLine ? 'Yes' : 'No',
      'Local Storage Available': typeof(Storage) !== 'undefined' ? 'Yes' : 'No',
      'Session Storage Available': sessionStorage ? 'Yes' : 'No',
    };

    console.group('%c🔧 Environment Information', 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.table(info);
    console.groupEnd();

    return info;
  },

  /**
   * Get localStorage content (excluding sensitive data)
   */
  getStorageInfo: () => {
    const storage = {};
    const sensitiveKeys = ['token', 'password', 'secret', 'api_key'];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const isSensitive = sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive));
      storage[key] = isSensitive ? '***REDACTED***' : localStorage.getItem(key);
    }

    console.group('%c💾 Local Storage Content', 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.table(storage);
    console.groupEnd();

    return storage;
  },

  /**
   * Check network status
   */
  checkNetworkStatus: () => {
    const status = {
      'Online': navigator.onLine,
      'Connection Type': navigator.connection?.effectiveType || 'Unknown',
      'Downlink Speed (Mbps)': navigator.connection?.downlink || 'Unknown',
      'Round Trip Time (ms)': navigator.connection?.rtt || 'Unknown',
      'Save Data': navigator.connection?.saveData || false,
    };

    console.group('%c🌐 Network Status', 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.table(status);
    console.groupEnd();

    appLogger.info('Network status checked', status);
    return status;
  },

  /**
   * Display all logs statistics
   */
  displayStatistics: () => {
    console.group('%c📈 Application Statistics', 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.log('%cAPI Logger Stats:', 'font-weight: bold;');
    apiLogger.printStats();
    console.log('%cNetwork Logger Stats:', 'font-weight: bold;');
    networkLogger.printStats();
    console.groupEnd();
  },

  /**
   * Simulate a test API call
   */
  testAPICall: async (endpoint = '/api/v1/health') => {
    appLogger.info(`🧪 Testing API call to ${endpoint}`);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      appLogger.info('API call successful', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        data,
      });

      console.group('%c✅ Test API Call Result', 'color: #00cc00; font-weight: bold; font-size: 13px;');
      console.log('%cEndpoint:', 'font-weight: bold;', endpoint);
      console.log('%cStatus:', 'font-weight: bold;', `${response.status} ${response.statusText}`);
      console.log('%cResponse:', 'font-weight: bold;', data);
      console.groupEnd();

      return { success: true, status: response.status, data };
    } catch (error) {
      appLogger.error('API call failed', {
        endpoint,
        error: error.message,
      });

      console.group('%c❌ Test API Call Failed', 'color: #cc0000; font-weight: bold; font-size: 13px;');
      console.log('%cEndpoint:', 'font-weight: bold;', endpoint);
      console.log('%cError:', 'font-weight: bold;', error.message);
      console.groupEnd();

      return { success: false, error: error.message };
    }
  },

  /**
   * Complete diagnostic report
   */
  runFullDiagnostics: async () => {
    console.clear();
    appLogger.info('🔍 Starting Full Diagnostics...\n');

    console.group('%c🚀 FULL DIAGNOSTIC REPORT', 'color: #0066cc; font-weight: bold; font-size: 14px;');

    // 1. Environment
    console.log('\n%c1️⃣ ENVIRONMENT', 'color: #0066cc; font-weight: bold; font-size: 12px;');
    this.getEnvironmentInfo();

    // 2. Network Status
    console.log('\n%c2️⃣ NETWORK STATUS', 'color: #0066cc; font-weight: bold; font-size: 12px;');
    this.checkNetworkStatus();

    // 3. Storage
    console.log('\n%c3️⃣ STORAGE', 'color: #0066cc; font-weight: bold; font-size: 12px;');
    this.getStorageInfo();

    // 4. Connectivity Test
    console.log('\n%c4️⃣ CONNECTIVITY TESTS', 'color: #0066cc; font-weight: bold; font-size: 12px;');
    await this.testConnectivity();

    // 5. Statistics
    console.log('\n%c5️⃣ STATISTICS', 'color: #0066cc; font-weight: bold; font-size: 12px;');
    this.displayStatistics();

    console.groupEnd();
    appLogger.info('✅ Full diagnostics completed');
  },

  /**
   * Format and display a log entry
   */
  displayLogEntry: (requestId) => {
    appLogger.info(`Displaying log entry for ${requestId}`);
    // This would typically fetch from a log store
    console.log(`Log entry details for ${requestId}`);
  },

  /**
   * Export logs as JSON
   */
  exportLogs: () => {
    const logData = {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      network: this.checkNetworkStatus(),
      storage: this.getStorageInfo(),
      apiStats: apiLogger.getStats(),
      networkStats: networkLogger.getStats(),
    };

    console.group('%c📥 Exported Logs', 'color: #0066cc; font-weight: bold; font-size: 13px;');
    console.log('Copy the data below to save it:');
    console.log(JSON.stringify(logData, null, 2));
    console.groupEnd();

    return logData;
  },
};

/**
 * Make debug helper available in window for easy access in console
 */
if (typeof window !== 'undefined') {
  window.debugHelper = debugHelper;
  window.apiLogger = apiLogger;
  window.appLogger = appLogger;

  appLogger.info('🛠️ Debug helper available - Use window.debugHelper in console');
  appLogger.info('Example commands:');
  appLogger.info('  debugHelper.testConnectivity()');
  appLogger.info('  debugHelper.runFullDiagnostics()');
  appLogger.info('  debugHelper.getEnvironmentInfo()');
  appLogger.info('  debugHelper.checkNetworkStatus()');
  appLogger.info('  debugHelper.testAPICall("/api/v1/accounts")');
  appLogger.info('  apiLogger.printStats()');
}

export default debugHelper;


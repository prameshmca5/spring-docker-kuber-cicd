/**
 * Example Usage of Logging System
 * Copy and paste these examples into browser console to test
 */

// ============================================
// 1. BASIC LOGGING EXAMPLES
// ============================================

// Log different levels
appLogger.debug('This is debug info', { key: 'value' });
appLogger.info('This is info', { data: 'example' });
appLogger.warn('This is a warning', { issue: 'minor' });
appLogger.error('This is an error', { error: 'critical' });


// ============================================
// 2. API LOGGING EXAMPLES
// ============================================

// API logger usage
apiLogger.debug('Preparing to fetch accounts');
apiLogger.info('Accounts fetched successfully', { count: 5 });
apiLogger.error('Failed to fetch accounts', { status: 500 });


// ============================================
// 3. REQUEST/RESPONSE LOGGING
// ============================================

// These are called automatically, but here's how they work:
const requestId = networkLogger.logRequest(
  'GET',
  '/api/v1/accounts',
  null,
  { 'Content-Type': 'application/json' }
);

networkLogger.logResponse(requestId, 200, [{ id: 1, name: 'Account 1' }]);
networkLogger.logError(requestId, 500, new Error('Server error'), 'Internal Server Error');


// ============================================
// 4. COMPONENT LIFECYCLE LOGGING
// ============================================

// Log component mounting
componentLogger.logComponentMount('AccountsList');

// Log component unmounting
componentLogger.logComponentUnmount('AccountsList');


// ============================================
// 5. NAVIGATION LOGGING
// ============================================

// Log page navigation
appLogger.logNavigation('/login', '/dashboard');


// ============================================
// 6. STATISTICS
// ============================================

// Print statistics
apiLogger.printStats();

// Get statistics object
const stats = apiLogger.getStats();
console.log(`Success Rate: ${stats.successRate}`);
console.log(`Total Requests: ${stats.requests}`);
console.log(`Total Errors: ${stats.errors}`);


// ============================================
// 7. DEBUG HELPER - CONNECTIVITY TESTS
// ============================================

// Test all endpoints
debugHelper.testConnectivity();

// Test specific endpoint
debugHelper.testAPICall('/api/v1/accounts');
debugHelper.testAPICall('/api/v1/employees');
debugHelper.testAPICall('/api/v1/transactions');


// ============================================
// 8. DEBUG HELPER - ENVIRONMENT INFO
// ============================================

// Get environment information
debugHelper.getEnvironmentInfo();

// Check network status
debugHelper.checkNetworkStatus();

// View storage content
debugHelper.getStorageInfo();


// ============================================
// 9. DEBUG HELPER - FULL DIAGNOSTICS
// ============================================

// Run complete diagnostic report
debugHelper.runFullDiagnostics();


// ============================================
// 10. DEBUG HELPER - EXPORT LOGS
// ============================================

// Export all logs as JSON
const allLogs = debugHelper.exportLogs();
console.log(allLogs);

// Copy to clipboard (in modern browsers)
copy(JSON.stringify(allLogs, null, 2));


// ============================================
// 11. CLEAR AND RESET
// ============================================

// Clear all logs and reset counters
apiLogger.clear();
appLogger.clear();


// ============================================
// 12. REAL-WORLD SCENARIOS
// ============================================

// SCENARIO 1: Debugging a failed API call
// 1. Open console
// 2. Perform action (e.g., click "Load Accounts")
// 3. Look for red ❌ ERROR logs
// 4. Check the status code:
//    - 0 = Network error
//    - 4xx = Client error
//    - 5xx = Server error
// 5. Check the URL in the log
// 6. Check the response error details

// SCENARIO 2: Verifying API connectivity
debugHelper.testConnectivity();
// This tests all main endpoints and shows which ones are reachable

// SCENARIO 3: Checking if backend is running
debugHelper.testAPICall('/api/v1/accounts');
// If this returns an error, backend might not be running

// SCENARIO 4: Monitoring success rate
const stats = apiLogger.getStats();
if (stats.successRate < 90) {
  console.warn(`Warning: Success rate is ${stats.successRate}%`);
}

// SCENARIO 5: Checking network connectivity
debugHelper.checkNetworkStatus();
// Shows if device is online and connection type

// SCENARIO 6: Finding a specific request
apiLogger.info('Looking for request that happened 5 minutes ago');
// Scroll through console logs and use Ctrl+F to search

// SCENARIO 7: Exporting logs for team analysis
const logs = debugHelper.exportLogs();
// Copy the JSON output and share with team


// ============================================
// 13. USING CUSTOM LOGGERS
// ============================================

import Logger from './utils/logger';

// Create a logger for a specific module
const myModuleLogger = new Logger('MyModule');
myModuleLogger.info('MyModule initialized');
myModuleLogger.debug('Debug data', { custom: 'value' });


// ============================================
// 14. MONITORING IN PRODUCTION
// ============================================

// Open console in production
// Keep it open while users interact with the app
// Monitor for red ❌ ERROR logs
// Watch success rate: apiLogger.printStats()
// If high error rate, run diagnostics: debugHelper.runFullDiagnostics()


// ============================================
// 15. USEFUL CONSOLE TRICKS
// ============================================

// Filter logs by level
// In DevTools Console:
// 1. Click filter icon
// 2. Type "[ERROR]" to see only errors
// 3. Type "[INFO]" to see only info logs

// Copy a request to curl
// 1. Look at the request log
// 2. Note method, URL, and body
// 3. Create curl command:
curl -X GET \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/v1/accounts"

// Save logs to file
// 1. Export logs: const logs = debugHelper.exportLogs()
// 2. Copy the JSON
// 3. Create a text file and paste
// 4. Save as .json file for analysis


// ============================================
// KEYBOARD SHORTCUTS
// ============================================

// Open DevTools: F12 or Ctrl+Shift+I
// Go to Console: Ctrl+Shift+K
// Clear Console: Ctrl+L or type: clear()
// Search in Console: Ctrl+F
// Copy text: Ctrl+C
// Paste text: Ctrl+V


// ============================================
// PERFORMANCE TIPS
// ============================================

// If too many logs are slowing down the app:
// 1. Change log level in logger.js
// 2. Set to WARN or ERROR only
// 3. Or clear logs periodically: apiLogger.clear()

// To minimize log storage:
// 1. Logs only exist in browser memory
// 2. Refreshing page clears all logs
// 3. Export before refreshing if needed


// ============================================
// INTEGRATION WITH COMPONENTS
// ============================================

// Example in a React component:
import { componentLogger, apiLogger } from './utils/logger';
import AccountService from './services/AccountService';

function MyComponent() {
  useEffect(() => {
    componentLogger.logComponentMount('MyComponent');

    // Fetch accounts
    AccountService.getAllAccounts()
      .then(response => {
        apiLogger.info('Accounts loaded', { count: response.data.length });
      })
      .catch(error => {
        apiLogger.error('Failed to load accounts', { status: error.response?.status });
      });

    return () => {
      componentLogger.logComponentUnmount('MyComponent');
    };
  }, []);

  return <div>Component content</div>;
}


// ============================================
// TROUBLESHOOTING GUIDE
// ============================================

// Problem: No logs appear
// Solution:
// 1. Check DevTools is open (F12)
// 2. Go to Console tab
// 3. Refresh page
// 4. Perform an action
// 5. Logs should appear

// Problem: Logs show 0 status
// Solution:
// 1. Network error (can't reach backend)
// 2. Check backend is running
// 3. Check Kubernetes pods: kubectl get pods
// 4. Check port forwarding

// Problem: Logs show 404 status
// Solution:
// 1. Endpoint doesn't exist
// 2. Check API URL in the log
// 3. Verify backend has this route
// 4. Check Kubernetes ingress routing

// Problem: Logs show 401 status
// Solution:
// 1. Authentication failed
// 2. Check token exists: debugHelper.getStorageInfo()
// 3. Log out and log back in
// 4. Check token is still valid

// Problem: Logs show 500 status
// Solution:
// 1. Server error
// 2. Check backend logs: kubectl logs deployment/service-name
// 3. Check database is running
// 4. Check service health

// ============================================
// END OF EXAMPLES
// ============================================

console.log('%c✅ Examples loaded successfully!', 'color: green; font-weight: bold;');
console.log('%cCopy and paste examples from this file into your console to test.', 'color: blue;');


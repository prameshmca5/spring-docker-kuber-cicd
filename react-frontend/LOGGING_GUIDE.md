# React Frontend Comprehensive Logging Guide

## Overview

A sophisticated logging system has been implemented for your React frontend to capture detailed request/response logs, helping you debug API issues in your Kubernetes environment.

## Features

### 1. **Multi-Level Logging**
- **DEBUG**: Detailed information for developers
- **INFO**: General informational messages
- **WARN**: Warning messages
- **ERROR**: Error messages with full context

### 2. **Request/Response Logging**
Each API call is logged with:
- Unique Request ID
- HTTP Method
- Full URL/Endpoint
- Headers (sanitized for sensitive data)
- Request Body
- Response Status
- Response Headers
- Response Body
- Timing information
- Error details with validation messages

### 3. **Automatic Axios Interceptors**
All HTTP requests through axios are automatically intercepted and logged without modifying service code.

### 4. **Console Grouping**
Logs are organized using console groups for easy navigation:
- 📤 REQUEST logs show request details
- 📥 RESPONSE logs show successful responses
- ❌ ERROR logs show failures with context

### 5. **Security**
Sensitive headers are automatically redacted:
- Authorization
- Cookie
- X-Auth-Token
- Password

## File Structure

```
react-frontend/src/
├── utils/
│   ├── logger.js              # Core logging utility
│   └── axiosInterceptor.js    # Axios request/response interceptors
├── services/
│   ├── AccountService.js      # Updated with logging
│   ├── EmployeeService.js     # Updated with logging
│   ├── TransactionService.js  # Updated with logging
│   └── NotificationService.js # Updated with logging
└── main.jsx                   # Application entry point with logger init
```

## How to Use

### 1. **View Logs in Browser Console**

Open your browser's Developer Tools (F12) and go to the Console tab.

All logs will appear in the console with color-coding:
- 🔵 INFO logs in blue
- 🟠 WARN logs in orange
- 🔴 ERROR logs in red
- ⚪ DEBUG logs in gray

### 2. **Import Logger in Components**

```javascript
import { appLogger, apiLogger, componentLogger } from './utils/logger';

// Log application events
appLogger.info('User clicked submit button');

// Log API-related events
apiLogger.debug('Fetching user data', { userId: 123 });

// Log component lifecycle
componentLogger.logComponentMount('UserForm');
```

### 3. **Available Logger Instances**

```javascript
import {
  appLogger,           // For general application logs
  apiLogger,           // For API-specific logs
  authLogger,          // For authentication logs
  componentLogger,     // For component lifecycle logs
  networkLogger        // For network communication (internal use)
} from './utils/logger';
```

### 4. **Logger Methods**

```javascript
// Basic logging
logger.debug(message, data);
logger.info(message, data);
logger.warn(message, data);
logger.error(message, data);

// Component lifecycle
logger.logComponentMount('ComponentName');
logger.logComponentUnmount('ComponentName');

// Navigation
logger.logNavigation(fromRoute, toRoute);

// View statistics
logger.printStats();  // Prints request/response statistics
const stats = logger.getStats();  // Get stats object

// Clear logs
logger.clear();  // Clear all logs and reset counters
```

## Example Log Output

### Successful Request/Response

```
[19:23:45.123] [INFO] [API] 📤 REQUEST [REQ-1]
Method: GET
URL: /api/v1/accounts
Headers: { Authorization: ***REDACTED*** }

[19:23:45.456] [INFO] [API] 📥 RESPONSE [RES-1] - REQ-1
Status: 200 OK
Body: [{ id: 1, name: "Checking", balance: 5000 }, ...]
```

### Error Request

```
[19:23:46.789] [ERROR] [API] ❌ ERROR [ERR-1] - REQ-2
Status: 404 Not Found
Message: Account not found
Error Details: { code: "ACCOUNT_NOT_FOUND", message: "Account with ID 999 not found" }
```

## Kubernetes Debugging Tips

### 1. **Check Network Connectivity**

```javascript
// In browser console
apiLogger.info('Testing API connectivity', { baseURL: window.location.origin });
```

When a request fails:
- Status 0 = Network error (DNS, firewall, timeout)
- Status 4xx = Client error
- Status 5xx = Server error

### 2. **Verify Service Discovery**

The logs will show the exact URL being called. In Kubernetes:

```bash
# Check if service is accessible
kubectl get service api-gateway -n default
kubectl port-forward service/api-gateway 8080:80 -n default
```

### 3. **Monitor CORS Issues**

CORS errors won't show as network errors; they'll show as failed requests. The console logs will indicate if it's a CORS issue based on the error response.

### 4. **Enable Network Tab**

Use Chrome DevTools Network tab alongside the console logs:
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action that makes API calls
4. Logs appear in Console tab with matching request IDs
5. Click request in Network tab to see headers/body

## Configuration

### Change Log Level

Edit `/src/utils/logger.js` line ~15:

```javascript
// Change this line to adjust log verbosity
const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG; // or INFO, WARN, ERROR
```

### Adjust Request Timeout

Edit individual service files (e.g., `AccountService.js`):

```javascript
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,  // Change this value (in milliseconds)
});
```

## Statistics & Monitoring

### Print Statistics

```javascript
// In browser console
import { apiLogger } from './utils/logger';
apiLogger.printStats();

// Output:
// requests: 42
// responses: 40
// errors: 2
// successRate: 95.24%
```

### Get Stats Object

```javascript
const stats = apiLogger.getStats();
console.log(`Success Rate: ${stats.successRate}`);
```

## Troubleshooting

### Issue: No logs appearing

**Solution**: 
1. Check if logging is initialized in `main.jsx`
2. Open DevTools Console tab (F12)
3. Check the JavaScript errors in the Console
4. Verify that axios interceptors are set up

### Issue: Sensitive data visible in logs

**Solution**:
Update the `sanitizeHeaders()` method in `/src/utils/logger.js` to redact additional headers.

### Issue: Too many logs

**Solution**:
Change `CURRENT_LOG_LEVEL` to `LOG_LEVELS.WARN` or `LOG_LEVELS.ERROR` in `/src/utils/logger.js`

### Issue: Logs show 'UNKNOWN' requestId

**Solution**:
This means the request failed before being sent. Check network connectivity and verify the API URL is correct.

## API Service Updates

All service files have been updated with:

1. ✅ Axios instance with logging
2. ✅ Request interceptors
3. ✅ Response interceptors
4. ✅ Error handling with detailed logs
5. ✅ Success confirmation logs

### Services Updated:
- ✅ AccountService.js
- ✅ EmployeeService.js
- ✅ TransactionService.js
- ✅ NotificationService.js

## Next Steps

1. **Build and Deploy**:
   ```bash
   npm run build
   docker build -t react-frontend:latest .
   ```

2. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f react-frontend-deployment.yaml
   ```

3. **Access Application**:
   - Open your frontend URL in browser
   - Open DevTools Console (F12)
   - Perform an action that calls an API
   - View detailed logs with request IDs and responses

4. **Monitor in Production**:
   - Keep the Console tab open
   - Watch for 4xx/5xx errors
   - Use request IDs to correlate with backend logs
   - Check success rate with `apiLogger.printStats()`

## Log Format Reference

### Request Log
```
[HH:MM:SS.mmm] [INFO] [API] 📤 REQUEST [REQ-N]
Method: <HTTP_METHOD>
URL: <FULL_URL>
Timestamp: <ISO_TIMESTAMP>
Headers: { key: value, ... }
Body: { ... }
```

### Response Log
```
[HH:MM:SS.mmm] [INFO] [API] 📥 RESPONSE [RES-N] - REQ-N
Status: <HTTP_STATUS> <STATUS_TEXT>
Timestamp: <ISO_TIMESTAMP>
Headers: { key: value, ... }
Body: { ... }
```

### Error Log
```
[HH:MM:SS.mmm] [ERROR] [API] ❌ ERROR [ERR-N] - REQ-N
Status: <HTTP_STATUS> <STATUS_TEXT>
Timestamp: <ISO_TIMESTAMP>
Message: <ERROR_MESSAGE>
Error Details: { ... }
```

## Support

For issues with logging:
1. Check the browser console for errors
2. Verify all service files are using the updated code
3. Ensure `setupAxiosInterceptors()` is called in each service
4. Check network connectivity to Kubernetes API Gateway
5. Review Kubernetes ingress configuration

---

**Last Updated**: March 9, 2026
**Version**: 1.0.0


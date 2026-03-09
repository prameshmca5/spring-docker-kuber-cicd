# React Frontend Logging - Quick Reference

## 🚀 Quick Start

1. **Open Browser DevTools**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Go to Console Tab**: Click on "Console" tab
3. **Run an API action**: Click a button that calls an API
4. **View logs**: Logs appear in console with color-coded levels

## 📋 Console Commands

Copy and paste these commands into the browser console:

### View Statistics
```javascript
apiLogger.printStats()
```

### Run Full Diagnostics
```javascript
debugHelper.runFullDiagnostics()
```

### Test API Connectivity
```javascript
debugHelper.testConnectivity()
```

### Test Specific Endpoint
```javascript
debugHelper.testAPICall('/api/v1/accounts')
```

### Get Environment Info
```javascript
debugHelper.getEnvironmentInfo()
```

### Check Network Status
```javascript
debugHelper.checkNetworkStatus()
```

### View Storage Content
```javascript
debugHelper.getStorageInfo()
```

### Export Logs
```javascript
debugHelper.exportLogs()
```

### Clear Logs
```javascript
apiLogger.clear()
```

## 🎨 Log Color Guide

| Color | Level | Meaning |
|-------|-------|---------|
| 🔵 Blue | INFO | Normal information |
| 🟠 Orange | WARN | Warning messages |
| 🔴 Red | ERROR | Error messages |
| ⚪ Gray | DEBUG | Detailed debug info |

## 📝 Log Format Examples

### Successful Request
```
[HH:MM:SS.mmm] [INFO] [API] 📤 REQUEST [REQ-1]
Method: GET
URL: /api/v1/accounts
```

### Successful Response
```
[HH:MM:SS.mmm] [INFO] [API] 📥 RESPONSE [RES-1] - REQ-1
Status: 200 OK
Body: [{id: 1, name: "Checking", balance: 5000}]
```

### Error Response
```
[HH:MM:SS.mmm] [ERROR] [API] ❌ ERROR [ERR-1] - REQ-1
Status: 404 Not Found
Message: Account not found
```

## 🔍 Debugging Checklist

- [ ] Open DevTools Console (F12)
- [ ] Check if logs appear when making API calls
- [ ] Look for error messages (🔴 RED)
- [ ] Check status codes (200=OK, 4xx=Client Error, 5xx=Server Error)
- [ ] Verify API endpoint URLs are correct
- [ ] Check network connectivity: `debugHelper.testConnectivity()`
- [ ] View success rate: `apiLogger.printStats()`

## 🐛 Common Issues

### Issue: No logs appearing
**Fix**: 
1. Open DevTools Console (F12)
2. Refresh page (Ctrl+R)
3. Perform an API action
4. Check console for any JavaScript errors

### Issue: Status 0 errors
**Meaning**: Network error (cannot reach server)
**Fix**:
1. Check if backend is running
2. Check Kubernetes service status
3. Run `debugHelper.testConnectivity()`

### Issue: Status 401 errors
**Meaning**: Unauthorized (invalid or missing token)
**Fix**:
1. Log out and log back in
2. Check `debugHelper.getStorageInfo()` for token
3. Verify token is being sent in headers

### Issue: Status 404 errors
**Meaning**: Endpoint not found
**Fix**:
1. Check API URL in logs
2. Verify backend service is running
3. Check Kubernetes ingress routes

### Issue: Status 500 errors
**Meaning**: Server error
**Fix**:
1. Check backend logs: `kubectl logs -f deployment/backend-service`
2. Check backend service health
3. Check database connectivity

## 📊 Interpreting Request ID

Each request has a unique ID:
- `REQ-1`, `REQ-2`, etc. = Requests
- `RES-1`, `RES-2`, etc. = Responses (paired with request)
- `ERR-1`, `ERR-2`, etc. = Errors

Example: `RES-1 - REQ-1` means Response 1 corresponds to Request 1

## 🔐 Security Notes

The logging system automatically redacts:
- Authorization tokens
- Cookies
- Passwords
- API keys

Sensitive data marked as `***REDACTED***`

## 📈 Performance Tips

### View Statistics
```javascript
// Check how many requests have been made
apiLogger.printStats()

// Output example:
// requests: 42
// responses: 40
// errors: 2
// successRate: 95.24%
```

### Monitor Success Rate
```javascript
const stats = apiLogger.getStats();
console.log(`Success Rate: ${stats.successRate}`);
```

## 🌐 Kubernetes Specific Debugging

### Check if Service is Accessible
```bash
# From your machine
curl -v http://localhost:3000/api/v1/accounts
```

### Port Forward to Service
```bash
# In terminal (while testing frontend)
kubectl port-forward service/api-gateway 8080:80
```

### Check Service Status
```bash
# Check if service is running
kubectl get service api-gateway -n default

# Get service details
kubectl describe service api-gateway -n default
```

### Check Pod Logs
```bash
# View backend service logs
kubectl logs -f deployment/account-service -n default

# View frontend logs (if applicable)
docker logs container_id
```

## 📞 Advanced Console Commands

### Function Breakdown
```javascript
// Available in browser console:
window.apiLogger      // API logger instance
window.appLogger      // App logger instance
window.debugHelper    // Debug helper utilities
```

### Manual Logging
```javascript
// Log custom messages
appLogger.info('Custom message', { data: 'value' });
apiLogger.error('API failed', { endpoint: '/api/v1/test' });
```

## 🎯 Typical Debugging Session

1. **Open DevTools**: F12
2. **Navigate to Console tab**
3. **Perform action**: Click a button that calls API
4. **Find logs**: Look for 📤 REQUEST, 📥 RESPONSE, or ❌ ERROR
5. **Check status code**: 200=OK, 4xx=Client Error, 5xx=Server Error
6. **View details**: Expand the log group to see full details
7. **Check response**: Look at the response body for data
8. **View stats**: Run `apiLogger.printStats()` to see success rate

## 📦 Files Created/Modified

### New Files
- ✅ `/src/utils/logger.js` - Core logging utility
- ✅ `/src/utils/axiosInterceptor.js` - Axios interceptors
- ✅ `/src/utils/debugHelper.js` - Debug utilities
- ✅ `/LOGGING_GUIDE.md` - Detailed guide
- ✅ `/LOGGING_QUICK_REFERENCE.md` - This file

### Modified Files
- ✅ `/src/main.jsx` - Initialize logging
- ✅ `/src/services/AccountService.js` - Added logging
- ✅ `/src/services/EmployeeService.js` - Added logging
- ✅ `/src/services/TransactionService.js` - Added logging
- ✅ `/src/services/NotificationService.js` - Added logging

## ✅ Verification

After deployment, verify logging is working:

```javascript
// In browser console
apiLogger.info('Test log entry')

// Should see:
// [HH:MM:SS.mmm] [INFO] [API] Test log entry
```

---

**Quick Access in Console:**
```javascript
// All available commands
window.debugHelper.testConnectivity()
window.debugHelper.runFullDiagnostics()
window.apiLogger.printStats()
window.appLogger.clear()
```

**Updated**: March 9, 2026


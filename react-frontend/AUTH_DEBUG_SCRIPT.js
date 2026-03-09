/**
 * 🔐 Authentication Debug & Fix Script
 *
 * Paste this entire script into browser console (F12) to diagnose
 * and automatically fix 401 authentication issues
 *
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Paste this entire script
 * 4. Run authDebugger.diagnose() or authDebugger.autoFix()
 */

const authDebugger = {
  colors: {
    success: 'color: #22c55e; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    warn: 'color: #f59e0b; font-weight: bold;',
    info: 'color: #3b82f6; font-weight: bold;',
    header: 'color: #8b5cf6; font-size: 14px; font-weight: bold; text-decoration: underline;',
  },

  /**
   * 🔍 Comprehensive diagnostic report
   */
  diagnose() {
    console.clear();
    console.log('%c=== 🔐 AUTHENTICATION DIAGNOSTIC REPORT ===', this.colors.header);

    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent.substring(0, 50),
      url: window.location.href,
      localStorage: {},
      token: {},
      authContext: {},
      axios: {},
      networkTest: {},
    };

    // Check localStorage
    console.log('%c📦 LOCAL STORAGE', this.colors.info);
    const token = localStorage.getItem('token');
    if (token) {
      console.log('%c✅ Token found in localStorage', this.colors.success);
      console.log(`    Length: ${token.length} characters`);
      report.token.present = true;
      report.token.length = token.length;

      // Try to decode token
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('%c✅ Token is valid JWT format', this.colors.success);
          console.log('    Issued at:', new Date(payload.iat * 1000).toISOString());
          console.log('    Expires at:', new Date(payload.exp * 1000).toISOString());
          console.log('    User:', payload.sub);
          console.log('    Role:', payload.role);
          report.token.valid = true;
          report.token.user = payload.sub;
          report.token.role = payload.role;
          report.token.expiry = new Date(payload.exp * 1000).toISOString();

          // Check expiration
          if (Date.now() > payload.exp * 1000) {
            console.log('%c⚠️ TOKEN EXPIRED', this.colors.warn);
            report.token.expired = true;
          }
        } else {
          console.log('%c❌ Token format invalid (not 3 parts)', this.colors.error);
          report.token.valid = false;
        }
      } catch (e) {
        console.log('%c❌ Token decode failed:', this.colors.error, e.message);
        report.token.valid = false;
      }
    } else {
      console.log('%c❌ No token found in localStorage', this.colors.error);
      console.log('    Action: User needs to login first');
      report.token.present = false;
    }

    // Check AuthContext (if available)
    console.log('%c🔑 AUTH CONTEXT', this.colors.info);
    if (window.__authContext) {
      console.log('%c✅ AuthContext available', this.colors.success);
      console.log('    User:', window.__authContext.user);
      console.log('    Has token:', !!window.__authContext.token);
    } else {
      console.log('%c⚠️ AuthContext not exposed (normal)', this.colors.warn);
    }

    // Check Axios configuration
    console.log('%c🌐 AXIOS CONFIGURATION', this.colors.info);
    try {
      // Try common axios instances
      const testEndpoint = '/api/v1/employees';
      console.log(`    Testing endpoint: ${testEndpoint}`);
      report.axios.defaultHeaders = Object.assign({}, axios.defaults.headers);
      console.log('    Default headers:', report.axios.defaultHeaders);

      if (report.axios.defaultHeaders.common?.Authorization) {
        console.log('%c✅ Authorization header configured globally', this.colors.success);
        console.log('    Value:', report.axios.defaultHeaders.common.Authorization.substring(0, 20) + '...');
      } else {
        console.log('%c⚠️ No Authorization header in axios defaults', this.colors.warn);
      }
    } catch (e) {
      console.log('%c⚠️ Axios not available:', this.colors.warn, e.message);
    }

    // Network connectivity test
    console.log('%c🔗 NETWORK TEST', this.colors.info);
    this.testConnectivity().then(result => {
      if (result.success) {
        console.log('%c✅ Network connectivity: OK', this.colors.success);
        report.networkTest = result;
      } else {
        console.log('%c❌ Network connectivity: FAILED', this.colors.error);
        console.log('    Error:', result.error);
        report.networkTest = result;
      }
    });

    // Recommendations
    console.log('%c💡 RECOMMENDATIONS', this.colors.header);
    const issues = [];

    if (!report.token.present) {
      issues.push('❌ No token found → User must login');
    }
    if (report.token.present && !report.token.valid) {
      issues.push('❌ Token format invalid → Clear localStorage and re-login');
    }
    if (report.token.expired) {
      issues.push('❌ Token expired → User must re-login');
    }
    if (!issues.length) {
      issues.push('✅ All checks passed! Token should be sent with requests.');
    }

    issues.forEach(issue => {
      const isError = issue.startsWith('❌');
      const color = isError ? this.colors.error : this.colors.success;
      console.log('%c' + issue, color);
    });

    return report;
  },

  /**
   * 🧪 Test API connectivity with token
   */
  testConnectivity() {
    return fetch('/api/v1/employees', {
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
        'Content-Type': 'application/json',
      },
    })
      .then(response => ({
        success: !response.status.toString().startsWith('4') && !response.status.toString().startsWith('5'),
        status: response.status,
        statusText: response.statusText,
      }))
      .catch(error => ({
        success: false,
        error: error.message,
      }));
  },

  /**
   * 🔧 Automatically fix common issues
   */
  autoFix() {
    console.clear();
    console.log('%c=== 🔧 AUTO-FIX ATTEMPTING ===', this.colors.header);

    const token = localStorage.getItem('token');

    // Fix 1: Check if token is invalid
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check expiration
        if (Date.now() > payload.exp * 1000) {
          console.log('%c⚠️ Fixing: Token expired, clearing...', this.colors.warn);
          localStorage.removeItem('token');
          console.log('%c✅ Fixed: Cleared expired token', this.colors.success);
          console.log('    Action: Refresh page and login again');
          return;
        }
      } catch (e) {
        console.log('%c⚠️ Fixing: Invalid token format, clearing...', this.colors.warn);
        localStorage.removeItem('token');
        console.log('%c✅ Fixed: Cleared invalid token', this.colors.success);
        console.log('    Action: Refresh page and login again');
        return;
      }
    }

    // Fix 2: Ensure token is in localStorage
    if (!token) {
      console.log('%c❌ Cannot fix: No token in localStorage', this.colors.error);
      console.log('    Action: You must login first');
      console.log('    Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Fix 3: Set auth header manually
    console.log('%c⚠️ Setting Authorization header manually...', this.colors.warn);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('%c✅ Authorization header set', this.colors.success);

    // Fix 4: Test the fix
    console.log('%c🧪 Testing fix...', this.colors.info);
    this.testConnectivity().then(result => {
      if (result.status === 200) {
        console.log('%c✅ FIX SUCCESSFUL! API is responding with 200', this.colors.success);
      } else if (result.status === 401) {
        console.log('%c❌ Fix unsuccessful: Still getting 401', this.colors.error);
        console.log('    Possible causes:');
        console.log('    1. Backend not configured for authentication');
        console.log('    2. Token is not being sent by backend during login');
        console.log('    3. Spring Security not enabled on backend');
      } else {
        console.log(`%c⚠️ Fix result: Status ${result.status}`, this.colors.warn);
      }
    });
  },

  /**
   * 🔄 Force re-login (clear auth data)
   */
  forceRelogin() {
    console.log('%c🔄 Clearing authentication...', this.colors.warn);
    localStorage.removeItem('token');
    sessionStorage.clear();
    console.log('%c✅ Cleared. Redirecting to login...', this.colors.success);
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  },

  /**
   * 📊 Show token details
   */
  showToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('%c❌ No token found', this.colors.error);
      return;
    }

    try {
      const parts = token.split('.');
      console.log('%c=== JWT TOKEN DETAILS ===', this.colors.header);
      console.log('%cHeader:', this.colors.info, JSON.parse(atob(parts[0])));
      console.log('%cPayload:', this.colors.info, JSON.parse(atob(parts[1])));
      console.log('%cFull Token:', this.colors.info, token);
    } catch (e) {
      console.log('%c❌ Error decoding token:', this.colors.error, e.message);
    }
  },

  /**
   * 📋 Show help menu
   */
  help() {
    console.clear();
    console.log('%c=== 🔐 AUTH DEBUGGER COMMANDS ===', this.colors.header);
    console.log('%c\nBasic Commands:', this.colors.info);
    console.log('  authDebugger.diagnose()     → Full diagnostic report');
    console.log('  authDebugger.autoFix()      → Auto-fix common issues');
    console.log('  authDebugger.testConnectivity() → Test API access');
    console.log('  authDebugger.showToken()    → Show token details');
    console.log('  authDebugger.forceRelogin() → Force re-login');
    console.log('%c\nQuick Checks:', this.colors.info);
    console.log('  localStorage.getItem("token")      → Check if token exists');
    console.log('  debugHelper.testConnectivity()     → Test endpoints');
    console.log('  debugHelper.runFullDiagnostics()   → Full system check');
  },
};

// Auto-run help on load
console.log('%c✅ Auth Debugger loaded! Type: authDebugger.help()', 'color: #22c55e; font-weight: bold;');


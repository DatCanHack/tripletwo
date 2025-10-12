# Debugging Guide for Authentication and Payment Issues

## What I've Added

### 1. Enhanced Checkout Component (`/src/pages/Checkout.jsx`)
- ✅ Added authentication check before payment creation
- ✅ Enhanced error handling with automatic token refresh
- ✅ Added retry logic for failed payments after token refresh
- ✅ Comprehensive debug logging for all payment operations
- ✅ Better user error messages

### 2. Debug Panel Component (`/src/components/DebugPanel.jsx`)
- ✅ Check headers being sent to backend
- ✅ Test token refresh functionality
- ✅ View current user state and cookies
- ✅ Real-time debugging information

### 3. Debug Logger Utility (`/src/utils/debugLogger.js`)
- ✅ Structured logging for authentication events
- ✅ API request/response logging
- ✅ Payment operation logging
- ✅ Error tracking with stack traces

## How to Debug Current Issues

### Step 1: Open Chrome DevTools
1. Go to your Checkout page
2. Open Developer Tools (F12)
3. Go to Console tab

### Step 2: Check Debug Logs
When you try to make a payment, you should see detailed logs:
- 🔐 AUTH logs for authentication events
- 🌐 API logs for network requests
- 💳 PAYMENT logs for payment operations
- ❌ ERROR logs for any failures

### Step 3: Use Debug Panel
1. Look for the Debug Panel in the bottom-right corner of the Checkout page
2. Click "Check Headers" to see what headers are being sent to your backend
3. Click "Test Token Refresh" to verify token refresh is working

### Step 4: Check Backend /debug/headers Endpoint
The debug panel calls `GET /debug/headers` which should return:
```json
{
  "headers": {
    "authorization": "Bearer <token>",
    "origin": "https://your-frontend-domain.com",
    "cookie": "refreshToken=<refresh_token>"
  },
  "user": { "id": "...", "email": "..." }
}
```

## Common Issues and Solutions

### Issue 1: 401 Unauthorized Errors
**Check:**
- Is the user logged in? (`user` object present)
- Is there an access token? (Check debugLogger output)
- Is the refresh token cookie being sent?

**Solution:**
The enhanced error handling now automatically attempts token refresh and retries the request.

### Issue 2: CORS Errors
**Check:**
- Are CORS headers present in the response?
- Is `credentials: 'include'` being sent?
- Is the frontend origin allowed in backend CORS config?

**Solution:**
Use the Debug Panel to verify headers are being sent correctly.

### Issue 3: Network Timeout
**Check:**
- Is the backend running and accessible?
- Is there a network connectivity issue?

**Solution:**
The code now handles NETWORK_ERROR and TIMEOUT specifically with user-friendly messages.

## Next Steps for Troubleshooting

1. **Deploy the Updated Code:**
   ```bash
   # Build and deploy frontend
   npm run build
   # Deploy to Amplify (automatically done via Git push if connected)
   ```

2. **Test Payment Flow:**
   - Go to Checkout page
   - Open DevTools Console
   - Attempt payment
   - Review debug logs

3. **Check Backend Logs:**
   - Check CloudWatch logs for your Lambda functions
   - Look for any 401/authentication errors
   - Verify CORS headers in responses

4. **API Testing:**
   - Use the Debug Panel to test headers
   - Test the `/debug/headers` endpoint directly
   - Verify token refresh is working

## What the Enhanced Code Does

### Authentication Flow:
1. Checks if user is authenticated before payment
2. On 401 error, automatically attempts token refresh
3. If refresh succeeds, retries the original payment request
4. Provides clear error messages for different failure scenarios

### Debug Information:
- All API calls are logged with timestamps
- Token presence is tracked
- Payment creation and responses are logged
- Errors include full context and stack traces

### User Experience:
- Clear error messages in Vietnamese
- Automatic retry on authentication failures
- No need to manually refresh page or re-login in most cases

## Remove Debug Features in Production

Before final deployment, remove:
1. Debug Panel from Checkout.jsx
2. Debug logging (it's already disabled in production via `import.meta.env.DEV`)
3. The /debug/headers endpoint from your backend

The debug logger automatically disables in production builds, but the Debug Panel should be removed manually.
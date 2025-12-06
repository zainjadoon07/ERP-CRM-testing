# Sentry Integration Guide

## Quick Setup (5 minutes)

### 1. Create Free Sentry Account
1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up with GitHub or email
3. Create a new project:
   - Platform: **Node.js**
   - Alert frequency: **Default**

### 2. Get Your DSN
After creating the project, copy your **DSN** (looks like: `https://xxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx`)

### 3. Add DSN to GitHub Secrets
1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SENTRY_DSN`
5. Value: Paste your DSN
6. Click **Add secret**

### 4. Update Production Workflow
The workflow is already configured to use `SENTRY_DSN` if it exists. No changes needed!

### 5. Test It
Once you deploy to production (push to `main`), errors will automatically appear in your Sentry dashboard.

## What's Monitored

✅ **Automatic Error Tracking**:
- Unhandled exceptions
- Promise rejections
- HTTP errors (500, 404, etc.)
- Database errors

✅ **Performance Monitoring**:
- Request duration
- Slow endpoints
- Database query performance

✅ **Context Captured**:
- Request headers
- User IP
- Environment (production/staging)
- Stack traces

## Viewing Errors

1. Go to [sentry.io](https://sentry.io)
2. Select your project
3. View **Issues** tab for errors
4. View **Performance** tab for slow requests

## Optional: Test Locally

To test Sentry locally:
```bash
# Add to backend/.env
SENTRY_DSN=your-dsn-here
NODE_ENV=production

# Start server
npm start

# Trigger a test error (in any endpoint)
throw new Error('Test Sentry integration');
```

---

**Done!** Sentry is now integrated and will track all production errors automatically.

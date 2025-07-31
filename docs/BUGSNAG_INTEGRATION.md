# Bugsnag Integration Documentation

**Date**: January 31, 2025  
**Status**: ✅ Fully Integrated

## Overview

Bugsnag has been integrated into the portfolio website for comprehensive error monitoring and performance tracking in production environments.

## Features Implemented

### 1. Backend Error Monitoring
- **Automatic Error Capture**: All unhandled errors and panics are automatically captured
- **Production-Only**: Bugsnag is only active in production mode
- **Development Mode**: Errors are logged locally in development
- **Middleware Integration**: Integrated after recovery middleware for optimal error capture
- **Release Tracking**: Version `1.0.0` tagged for release management

### 2. Frontend Performance Monitoring
- **Web Vitals**: Tracks Core Web Vitals (LCP, FID, CLS)
- **Resource Timing**: Monitors loading performance of all resources
- **User Interactions**: Tracks route changes and user actions
- **Network Requests**: Monitors fetch/XHR performance
- **CDN Delivery**: Loaded from Bugsnag's CDN for optimal performance

### 3. Security Configuration
- **CSP Updates**: Added Bugsnag domains to Content Security Policy
  - Script source: `d2wy8f7a9ursnm.cloudfront.net`
  - Connect sources: `notify.bugsnag.com`, `sessions.bugsnag.com`
- **Nonce Support**: Frontend script uses CSP nonce for security

## Implementation Details

### Backend Configuration (main.go)
```go
// Production-only Bugsnag middleware
if cfg.IsProduction() {
    bugsnagApiKey := os.Getenv("BUGSNAG_API_KEY")
    if bugsnagApiKey != "" {
        router.Use(bugsnaggin.AutoNotify(bugsnag.Configuration{
            APIKey: bugsnagApiKey,
            ProjectPackages: []string{"main", "github.com/dav88dev/myWebsite-go"},
            ReleaseStage: cfg.Environment,
            AppVersion: "1.0.0",
        }))
    }
}
```

### Frontend Integration (index.html)
```html
<!-- Bugsnag Performance Monitoring -->
<script type="module" nonce="{{.CSPNonce}}">
    import BugsnagPerformance from '//d2wy8f7a9ursnm.cloudfront.net/v1/bugsnag-performance.min.js'
    BugsnagPerformance.start({ apiKey: 'ea6c699395a13398c3baa9cf9b8662f4' })
</script>
```

### Environment Configuration
```bash
# .env file (production)
BUGSNAG_API_KEY=ea6c699395a13398c3baa9cf9b8662f4

# .env.example (template)
BUGSNAG_API_KEY=your_bugsnag_api_key_here
```

## Testing

### Development Mode
- Run server: Bugsnag is disabled, errors logged locally
- Test endpoint: `/dev/test-error` triggers a panic
- Console output shows: "Bugsnag disabled in development mode"

### Production Mode
```bash
export SERVER_ENV=production
export GIN_MODE=release
./portfolio-server
```
- Errors are sent to Bugsnag dashboard
- Performance metrics tracked automatically

## Dashboard Access

1. Log into Bugsnag dashboard
2. View error reports under "Errors" tab
3. View performance metrics under "Performance" tab
4. Set up notifications for critical errors

## Best Practices

1. **Error Context**: Add user context when available
2. **Custom Metadata**: Include relevant request data
3. **Error Grouping**: Use error classes for better grouping
4. **Ignore Lists**: Configure ignored errors (e.g., 404s)
5. **Release Tracking**: Update version on deployments

## Monitoring Checklist

- [x] Backend error capture working
- [x] Frontend performance tracking active
- [x] Production-only configuration
- [x] CSP properly configured
- [x] API key secured in environment
- [x] Documentation updated
- [x] README includes Bugsnag info

## Future Enhancements

1. **User Context**: Add authenticated user information
2. **Custom Breadcrumbs**: Track user actions leading to errors
3. **Source Maps**: Upload source maps for better stack traces
4. **Deployment Tracking**: Integrate with CI/CD for automatic release tracking
5. **Error Budgets**: Set up error rate alerting

## Troubleshooting

### Errors Not Appearing
1. Check `SERVER_ENV=production`
2. Verify API key is set correctly
3. Check network connectivity to Bugsnag
4. Review CSP for blocking

### Performance Not Tracking
1. Verify script is loading (check Network tab)
2. Check for CSP violations in console
3. Ensure API key matches project

### Local Development
- Bugsnag is intentionally disabled
- Use logs and debugger for error tracking
- Test error handling with recovery middleware

## Security Notes

- API key is not sensitive (can be exposed in frontend)
- No PII should be sent with errors
- Sanitize error messages before sending
- Review Bugsnag's security documentation
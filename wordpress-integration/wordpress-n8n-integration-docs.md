# WordPress and React Integration with n8n

This documentation provides guidance on how the WordPress, n8n, and React integration is set up and how to maintain it.

## Architecture Overview

The integration uses three main components:

1. **WordPress backend** (cms.mardenseo.com)
2. **n8n middleware** (api.mardenseo.com)
3. **React+Vite frontend** (mardenseo.com)

## Configuration Files

### WordPress CORS Plugin
- Location: `/wp-content/plugins/my-rest-api-cors/my-rest-api-cors.php`
- Purpose: Provides proper CORS headers for API requests
- Configuration: Add `define('MARDEN_API_SECRET', 'your-secure-api-secret-here');` to `wp-config.php`

### n8n Workflows
1. **Content Retrieval Workflow**
   - Endpoint: `/api/content`
   - Purpose: Fetches WordPress posts/pages and formats them for the React frontend

2. **Authentication Workflow**
   - Endpoint: `/api/auth`
   - Purpose: Handles JWT authentication with WordPress

3. **Form Submission Workflow**
   - Endpoint: `/api/forms/submit`
   - Purpose: Validates and submits contact form data to WordPress

### Frontend Integration
- File: `/js/wordpress-integration.js`
- Purpose: Provides API client for WordPress integration
- Usage: Include via `<script src="/js/wordpress-integration.js"></script>` before closing body tag

### Nginx Configuration
- Location: `/etc/nginx/sites-available/api.mardenseo.com.conf`
- Purpose: Proxies requests to n8n and adds security headers

## Security Considerations

1. **API Secret**
   - The `X-API-SECRET` header is required for non-JWT authenticated requests
   - This value must match between frontend, nginx, and WordPress

2. **JWT Authentication**
   - Used for authenticated user requests
   - Tokens are stored in localStorage and automatically included in requests

3. **Nginx Security**
   - TLS 1.2/1.3 only
   - Strong ciphers
   - Security headers (HSTS, CSP, etc.)
   - Only specific endpoints exposed

## Maintenance Tasks

### WordPress Updates
1. Ensure the CORS plugin is compatible with WordPress updates
2. Test the API endpoints after updates

### n8n Updates
1. Backup workflows before updating:
   ```
   docker exec n8n-restored n8n export:workflow --all --output=/tmp/n8n-backup.json
   docker cp n8n-restored:/tmp/n8n-backup.json /path/to/backup/
   ```
2. Update the container and test workflows

### Frontend Updates
1. Test the integration scripts when updating the frontend
2. Clear localStorage cache if authentication changes

## Troubleshooting

### CORS Issues
1. Check browser console for errors
2. Verify the CORS plugin is active in WordPress
3. Ensure CORS headers in nginx match the frontend domain

### Authentication Problems
1. Test JWT endpoint directly
2. Check WordPress plugin configuration
3. Verify credentials in n8n 

### Form Submission Errors
1. Enable debugging in the n8n workflow
2. Check WordPress logs for errors
3. Verify custom endpoint is properly registered

## API Endpoints

### Content Retrieval
- **URL**: `https://api.mardenseo.com/api/content`
- **Method**: GET
- **Authentication**: Optional
- **Parameters**:
  - `page` (optional): Page number
  - `per_page` (optional): Items per page

### Authentication
- **URL**: `https://api.mardenseo.com/api/auth`
- **Method**: POST
- **Authentication**: None
- **Body**:
  ```json
  {
    "username": "wordpress_username",
    "password": "wordpress_password"
  }
  ```

### Form Submission
- **URL**: `https://api.mardenseo.com/api/forms/submit`
- **Method**: POST
- **Authentication**: API Secret
- **Headers**:
  - `X-API-SECRET`: Your secret key
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "This is a test message"
  }
  ```

## Backup Procedures

### WordPress
1. Regular database backups
2. Export plugin and theme files

### n8n
1. Export workflows regularly:
   ```
   docker exec n8n-restored n8n export:workflow --all --output=/tmp/n8n-backup.json
   ```
2. Backup credentials separately and securely

### Frontend
1. Store all integration code in version control
2. Document any environment-specific configurations

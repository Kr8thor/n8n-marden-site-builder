# WordPress-React Integration with n8n

This folder contains all the necessary files for integrating a WordPress backend with a React+Vite frontend using n8n as middleware.

## Files Included

1. **marden-seo-rest-api-cors.php**: WordPress plugin for handling CORS and API security
2. **wordpress-integration.js**: Frontend integration script for React/JavaScript
3. **wordpress-react-workflow.json**: n8n workflow for content, authentication, and form submission

## Setup Instructions

### WordPress Configuration

1. Upload the `marden-seo-rest-api-cors.php` plugin to WordPress:
   - Create a directory `wp-content/plugins/marden-seo-rest-api-cors/`
   - Place the PHP file in this directory

2. Add the following to your `wp-config.php`:
   ```php
   define('MARDEN_API_SECRET', 'your-secure-api-secret-here'); // Change this to a secure random string
   ```

3. Activate the plugin in the WordPress admin panel

### n8n Configuration

1. Import the `wordpress-react-workflow.json` workflow into n8n
2. Update the WordPress credentials to point to your WordPress site
3. Create a Header Auth credential with:
   - Name: `X-API-SECRET`
   - Value: `your-secure-api-secret-here` (same as in wp-config.php)

### Frontend Configuration

1. Add the `wordpress-integration.js` script to your React/Vite project
2. Include it in your HTML:
   ```html
   <script src="/js/wordpress-integration.js"></script>
   ```
3. Update the configuration variables at the top of the script:
   ```javascript
   const API_BASE_URL = 'https://your-n8n-domain.com'; // Your n8n webhook URL
   const API_SECRET = 'your-secure-api-secret-here'; // Same as in WordPress
   ```

4. Add the `data-wp-form="contact"` attribute to your contact forms:
   ```html
   <form data-wp-form="contact">
     <!-- Form fields -->
   </form>
   ```

## API Endpoints

- `/api/content` - Retrieve WordPress content
- `/api/menu` - Get WordPress menu structure
- `/api/forms/submit` - Submit form data
- `/api/auth` - Authenticate with WordPress

## Security Considerations

1. Always use HTTPS for all API communications
2. Generate a strong, random API secret key
3. Regularly rotate the API secret
4. Use proper authentication for admin operations
5. Keep n8n and WordPress fully updated

## Maintenance

- When updating WordPress, ensure the CORS plugin is still compatible
- After n8n updates, verify all workflows still function correctly
- If you change the API endpoints, update both the n8n workflow and frontend script

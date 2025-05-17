# WordPress Integration for MardenSEO

This directory contains the necessary files to integrate a WordPress backend with the MardenSEO frontend using n8n as middleware.

## Contents

1. **n8n Workflows**
   - `wordpress_integration_workflow.json` - Main content synchronization workflow
   - `wordpress_auth_workflow.json` - Authentication workflow

2. **Frontend Integration**
   - `wordpress-integration.js` - JavaScript library to connect frontend with n8n

3. **WordPress Configuration**
   - `my-rest-api-cors.php` - WordPress plugin for CORS and form handling

4. **Server Configuration**
   - `nginx-n8n-proxy.conf` - Nginx configuration for proxying requests to n8n

5. **Testing**
   - `test-n8n-webhooks.sh` - Bash script to test webhook functionality

## Integration Steps

1. **n8n Setup**
   - Import the workflow JSON files into n8n
   - Configure WordPress credentials in n8n
   - Ensure webhooks are accessible

2. **WordPress Setup**
   - Install and activate the CORS plugin
   - Configure JWT Authentication for WordPress

3. **Frontend Integration**
   - Add the `wordpress-integration.js` to your frontend
   - Update the site URL in the script if necessary

4. **Server Configuration**
   - Configure Nginx to proxy requests to n8n
   - Ensure proper security headers are set

## Usage Examples

### Fetching Content

```javascript
// Get latest posts
WordPressAPI.fetchContent({
  contentType: 'posts',
  page: 1,
  perPage: 10
})
  .then(posts => {
    console.log('Posts:', posts);
  })
  .catch(error => {
    console.error('Error fetching posts:', error);
  });
```

### Form Submission

```javascript
// Submit contact form
WordPressAPI.submitForm({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I\'d like to inquire about your services.'
})
  .then(result => {
    console.log('Form submitted:', result);
  })
  .catch(error => {
    console.error('Error submitting form:', error);
  });
```

### Authentication

```javascript
// Login to WordPress
WordPressAPI.login('username', 'password')
  .then(auth => {
    console.log('Authenticated:', auth);
  })
  .catch(error => {
    console.error('Authentication error:', error);
  });
```

## Security Considerations

- Ensure proper CORS configuration to prevent unauthorized access
- Use HTTPS for all API endpoints
- Consider implementing rate limiting to prevent abuse
- Validate all input data on both client and server sides

## Troubleshooting

If you encounter issues:

1. Check n8n logs for errors
2. Verify CORS headers are properly set
3. Test webhooks using the provided testing script
4. Check browser console for JavaScript errors

## Maintenance

This integration should be reviewed periodically to ensure:

1. Security updates are applied
2. WordPress version compatibility
3. Frontend framework compatibility
4. API endpoints remain functional

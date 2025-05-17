# WordPress and React Integration with n8n - Plugin Setup

To finalize the integration for WordPress, follow these steps:

## 1. Setting up the WordPress Plugin

1. Upload the plugin to WordPress:
   - Access your WordPress site via FTP or file manager
   - Navigate to: `/wp-content/plugins/`
   - Create a folder named `my-rest-api-cors`
   - Copy `my-rest-api-cors.php` into this folder

   ```
   wp-content/plugins/
   └── my-rest-api-cors/
       └── my-rest-api-cors.php
   ```

2. Add API Secret to wp-config.php:
   - Access your WordPress site's root directory
   - Edit `wp-config.php`
   - Add this line before "That's all, stop editing!":
     ```php
     // API Secret for integration with React frontend via n8n
     define('MARDEN_API_SECRET', 'your-secure-random-key-here');
     ```

3. Activate the plugin in WordPress admin:
   - Log in to your WordPress dashboard
   - Go to Plugins → Installed Plugins
   - Find "My REST API CORS" and click "Activate"

## 2. Testing the Integration

1. Use the `integration-test.html` file to test all components:
   - Save the file to your local computer
   - Open it in a browser
   - Update the API_BASE_URL in the script if needed
   - Click each test button to verify functionality

2. Troubleshooting:
   - Check browser console for JavaScript errors
   - Verify WordPress plugin activation status
   - Ensure the API secret matches in:
     * WordPress wp-config.php
     * n8n HTTP Request nodes
     * Frontend JavaScript

## 3. Nginx Proxy Configuration

For production, configure your nginx server:

```
server {
    listen 80;
    server_name api.mardenseo.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mardenseo.com;
    
    # SSL configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    
    # Proxy to n8n
    location /myapp/ {
        proxy_pass http://localhost:5678/webhook/myapp/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Block access to other paths
    location / {
        return 404;
    }
}
```

This setup will ensure your WordPress, n8n, and React frontend integration works securely and reliably.

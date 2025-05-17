# WordPress Configuration Guide

This guide explains how to set up your WordPress site to work with the Marden Site Builder workflow.

## Required Plugins

1. **JWT Authentication for WP REST API**
   - Download from: [https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
   - This enables secure authentication between your frontend and WordPress

2. **WP API Menus** (optional, for menu support)
   - Download from: [https://wordpress.org/plugins/wp-api-menus/](https://wordpress.org/plugins/wp-api-menus/)
   - This adds menu endpoints to the WordPress REST API

## JWT Authentication Setup

### 1. Install and Activate the Plugin

1. Download the JWT Authentication plugin
2. Upload to your WordPress site
3. Activate the plugin

### 2. Configure .htaccess

Add the following code to your `.htaccess` file:

```apacheconf
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

### 3. Configure wp-config.php

Add the following code to your `wp-config.php` file:

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key');
define('JWT_AUTH_CORS_ENABLE', true);
```

Replace `'your-secret-key'` with a strong, unique key. You can generate one at [https://api.wordpress.org/secret-key/1.1/salt/](https://api.wordpress.org/secret-key/1.1/salt/)

## Custom Form Submission Endpoint

To handle form submissions from the Marden Site Builder, add the following code to your theme's `functions.php` file:

```php
<?php
// Register custom REST API endpoint for form submissions
add_action('rest_api_init', function () {
    register_rest_route('myapp/v1', '/form-submission', array(
        'methods' => 'POST',
        'callback' => 'handle_form_submission',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));
});

// Handle form submissions
function handle_form_submission($request) {
    // Verify secret
    $headers = $request->get_headers();
    if (!isset($headers['x_api_secret'][0]) || $headers['x_api_secret'][0] !== 'YOUR_SHARED_SECRET_HERE') {
        return new WP_Error('unauthorized', 'Unauthorized access', array('status' => 401));
    }
    
    // Get the request parameters
    $params = $request->get_params();
    
    // Validate required fields
    if (empty($params['name']) || empty($params['email']) || empty($params['message'])) {
        return new WP_Error('missing_fields', 'Missing required fields', array('status' => 400));
    }
    
    // Validate email format
    if (!is_email($params['email'])) {
        return new WP_Error('invalid_email', 'Invalid email format', array('status' => 400));
    }
    
    // Process the form submission (e.g., save to database, send email)
    $name = sanitize_text_field($params['name']);
    $email = sanitize_email($params['email']);
    $message = sanitize_textarea_field($params['message']);
    
    // Example: Save as a post
    $post_id = wp_insert_post(array(
        'post_title' => 'Form Submission from ' . $name,
        'post_content' => $message,
        'post_type' => 'form_submission',
        'post_status' => 'private',
        'meta_input' => array(
            'email' => $email
        )
    ));
    
    if (is_wp_error($post_id)) {
        return new WP_Error('form_submission_failed', 'Failed to save form submission', array('status' => 500));
    }
    
    // Example: Send email notification
    $admin_email = get_option('admin_email');
    $subject = 'New Form Submission from ' . $name;
    $body = "Name: $name\nEmail: $email\nMessage: $message";
    
    wp_mail($admin_email, $subject, $body);
    
    // Return success response
    return array(
        'success' => true,
        'message' => 'Form submitted successfully',
        'submission_id' => $post_id
    );
}

// Create custom post type for form submissions
add_action('init', function () {
    register_post_type('form_submission', array(
        'labels' => array(
            'name' => 'Form Submissions',
            'singular_name' => 'Form Submission'
        ),
        'public' => false,
        'show_ui' => true,
        'capability_type' => 'post',
        'capabilities' => array(
            'create_posts' => false
        ),
        'map_meta_cap' => true,
        'supports' => array('title', 'editor')
    ));
});
?>
```

Remember to replace `'YOUR_SHARED_SECRET_HERE'` with the same secret you configure in the N8N workflow.

## CORS Configuration

To allow cross-origin requests from your frontend, add the following code to your `functions.php` file:

```php
<?php
// Add CORS headers
function add_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-API-SECRET, Authorization');
    
    if ('OPTIONS' == $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
}
add_action('init', 'add_cors_headers');
?>
```

For security, replace `*` with your frontend domain.

## Cache Invalidation Setup

For the content sync feature to work correctly, create a cache invalidation endpoint on your frontend. This could be a serverless function, API route, or service that clears the cache for specific content when triggered.

Example Next.js API route:

```javascript
// pages/api/cache-invalidate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Get the post ID from the request body
    const { post_id } = req.body;
    
    // Clear cache for this post
    // Implementation depends on your caching strategy
    
    // Example: If using Redis
    // const redis = require('redis');
    // const client = redis.createClient();
    // await client.del(`post:${post_id}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Cache invalidated successfully' 
    });
  } catch (error) {
    console.error('Cache invalidation failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to invalidate cache' 
    });
  }
}
```

## Security Recommendations

1. Use HTTPS for all API communication
2. Replace the placeholder shared secret with a strong, unique key
3. Consider using IP whitelisting for your API endpoints
4. Regularly audit and update WordPress and all plugins
5. Implement rate limiting to prevent abuse
6. Use nonce verification for additional security
7. Consider implementing OAuth2 for more advanced authentication needs
<?php
/**
 * Plugin Name: My REST API CORS
 * Description: Adds proper CORS headers for WordPress REST API for Marden SEO integration
 * Version: 1.0.0
 * Author: Marden SEO Team
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        // Allow specific domains
        header('Access-Control-Allow-Origin: https://mardenseo.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-API-SECRET');
        
        // Handle API secret for non-JWT authentication method
        if (isset($_SERVER['HTTP_X_API_SECRET'])) {
            $api_secret = $_SERVER['HTTP_X_API_SECRET'];
            $valid_secret = defined('MARDEN_API_SECRET') ? MARDEN_API_SECRET : 'marden-default-secret';
            
            if ($api_secret !== $valid_secret) {
                header('HTTP/1.1 403 Forbidden');
                echo json_encode(['error' => 'Invalid API Secret']);
                exit;
            }
        }
        
        return $value;
    }, 15);
}, 15);

// Add a snippet to wp-config.php to define the secret key
// define('MARDEN_API_SECRET', 'your-secure-api-secret-here');

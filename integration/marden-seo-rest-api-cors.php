<?php
/**
 * Plugin Name: Marden SEO REST API CORS
 * Description: Handle CORS and API security for React+Vite integration
 * Version: 1.0.0
 * Author: Marden SEO Team
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Add required constant to wp-config.php if not already defined
if (!defined('MARDEN_API_SECRET')) {
    // Default value for development, should be changed in production
    define('MARDEN_API_SECRET', 'marden-api-secret');
}

// Handle CORS for API requests
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $allowed_origins = array(
            'https://mardenseo.com',
            'https://www.mardenseo.com',
            'http://localhost:3000', // Development
            'http://localhost:5173'  // Vite dev server
        );
        
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } else {
            header('Access-Control-Allow-Origin: https://mardenseo.com');
        }
        
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-API-SECRET');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
        
        return $value;
    }, 15);
}, 15);

// Register custom endpoint for form submissions
add_action('rest_api_init', function() {
    register_rest_route('myapp/v1', '/form-submission', [
        'methods' => 'POST',
        'callback' => 'handle_form_submission',
        'permission_callback' => 'verify_api_secret'
    ]);
});

// Verify API secret for secure endpoints
function verify_api_secret() {
    // Skip check for development if needed
    if (defined('WP_DEBUG') && WP_DEBUG === true && isset($_GET['skip_auth']) && $_GET['skip_auth'] === 'true') {
        return true;
    }
    
    // Check for API Secret in headers
    $headers = getallheaders();
    $api_secret = isset($headers['X-API-SECRET']) ? $headers['X-API-SECRET'] : '';
    
    if (empty($api_secret) || $api_secret !== MARDEN_API_SECRET) {
        return new WP_Error(
            'invalid_api_secret',
            'Invalid or missing API secret',
            ['status' => 403]
        );
    }
    
    return true;
}

// Handle form submission
function handle_form_submission($request) {
    $params = $request->get_params();
    
    // Validate required fields
    $required_fields = ['name', 'email', 'message'];
    foreach ($required_fields as $field) {
        if (empty($params[$field])) {
            return new WP_Error(
                'missing_field',
                'Missing required field: ' . $field,
                ['status' => 400]
            );
        }
    }
    
    // Validate email format
    if (!is_email($params['email'])) {
        return new WP_Error(
            'invalid_email',
            'Invalid email format',
            ['status' => 400]
        );
    }
    
    // Create a new form submission post
    $post_data = [
        'post_title'   => 'Contact Form: ' . sanitize_text_field($params['name']),
        'post_content' => sanitize_textarea_field($params['message']),
        'post_status'  => 'private',
        'post_type'    => 'form_submission'
    ];
    
    // Insert the post
    $post_id = wp_insert_post($post_data);
    
    if (is_wp_error($post_id)) {
        return new WP_Error(
            'submission_failed',
            'Failed to save form submission',
            ['status' => 500]
        );
    }
    
    // Save additional metadata
    update_post_meta($post_id, 'submission_email', sanitize_email($params['email']));
    update_post_meta($post_id, 'submission_date', current_time('mysql'));
    update_post_meta($post_id, 'submission_source', isset($params['source']) ? sanitize_text_field($params['source']) : 'website');
    
    // Send email notification
    $to = get_option('admin_email');
    $subject = 'New Form Submission from ' . sanitize_text_field($params['name']);
    $message = "You have received a new form submission from your website:\n\n";
    $message .= "Name: " . sanitize_text_field($params['name']) . "\n";
    $message .= "Email: " . sanitize_email($params['email']) . "\n";
    $message .= "Message:\n" . sanitize_textarea_field($params['message']);
    
    wp_mail($to, $subject, $message);
    
    return [
        'success' => true,
        'message' => 'Form submitted successfully',
        'id' => $post_id
    ];
}

// Register custom form submission post type
add_action('init', function() {
    register_post_type('form_submission', [
        'labels' => [
            'name' => 'Form Submissions',
            'singular_name' => 'Form Submission'
        ],
        'public' => false,
        'show_ui' => true,
        'capability_type' => 'post',
        'capabilities' => [
            'create_posts' => 'do_not_allow'
        ],
        'map_meta_cap' => true,
        'supports' => ['title', 'editor'],
        'menu_icon' => 'dashicons-email-alt'
    ]);
});

// Add admin column for email
add_filter('manage_form_submission_posts_columns', function($columns) {
    $columns['submission_email'] = 'Email';
    $columns['submission_date'] = 'Submission Date';
    return $columns;
});

// Fill admin column data
add_action('manage_form_submission_posts_custom_column', function($column, $post_id) {
    switch ($column) {
        case 'submission_email':
            echo esc_html(get_post_meta($post_id, 'submission_email', true));
            break;
        case 'submission_date':
            echo esc_html(get_post_meta($post_id, 'submission_date', true));
            break;
    }
}, 10, 2);

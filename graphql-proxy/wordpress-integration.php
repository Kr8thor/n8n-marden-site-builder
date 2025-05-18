<?php
/**
 * WordPress GraphQL Integration for MardenSEO
 * 
 * This file contains the necessary WordPress configurations for GraphQL integration.
 * Add this code to your theme's functions.php or create a custom plugin.
 */

// Make sure WPGraphQL plugin is installed and activated

// Enable CORS for GraphQL API
add_action('graphql_response_headers', function($headers) {
    $headers['Access-Control-Allow-Origin'] = '*'; // In production, specify your frontend domain
    $headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    $headers['Access-Control-Allow-Credentials'] = 'true';
    $headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
    return $headers;
});

// Custom form submission mutation
add_action('graphql_register_types', function() {
    register_graphql_mutation('createFormSubmission', [
        'inputFields' => [
            'name' => ['type' => 'String', 'description' => 'Sender name'],
            'email' => ['type' => 'String', 'description' => 'Sender email'],
            'message' => ['type' => 'String', 'description' => 'Message content'],
        ],
        'outputFields' => [
            'success' => ['type' => 'Boolean', 'description' => 'Whether the submission was successful'],
            'message' => ['type' => 'String', 'description' => 'Response message'],
        ],
        'resolve' => function($root, $args, $context, $info) {
            // Validate inputs
            if (empty($args['name']) || empty($args['email']) || empty($args['message'])) {
                return [
                    'success' => false,
                    'message' => 'Missing required fields'
                ];
            }
            
            // Validate email
            if (!is_email($args['email'])) {
                return [
                    'success' => false,
                    'message' => 'Invalid email format'
                ];
            }
            
            // Create custom post type for storing form submissions
            // First, make sure the post type exists
            if (!post_type_exists('form_submission')) {
                register_post_type('form_submission', [
                    'labels' => [
                        'name' => 'Form Submissions',
                        'singular_name' => 'Form Submission',
                    ],
                    'public' => false,
                    'show_ui' => true,
                    'capability_type' => 'post',
                    'capabilities' => ['create_posts' => 'manage_options'],
                    'map_meta_cap' => true,
                    'hierarchical' => false,
                    'rewrite' => false,
                    'query_var' => false,
                    'supports' => ['title', 'editor', 'custom-fields'],
                    'show_in_graphql' => false,
                ]);
            }
            
            // Process the form submission
            $submission_id = wp_insert_post([
                'post_type' => 'form_submission',
                'post_title' => sanitize_text_field($args['name']) . ' - ' . date('Y-m-d H:i:s'),
                'post_status' => 'publish',
                'meta_input' => [
                    '_form_name' => sanitize_text_field($args['name']),
                    '_form_email' => sanitize_email($args['email']),
                    '_form_message' => sanitize_textarea_field($args['message']),
                ]
            ]);
            
            if (is_wp_error($submission_id)) {
                return [
                    'success' => false,
                    'message' => 'Error saving submission: ' . $submission_id->get_error_message()
                ];
            }
            
            // Send email notification if desired
            $to = get_option('admin_email');
            $subject = 'New Contact Form Submission from ' . $args['name'];
            $body = "Name: {$args['name']}\n";
            $body .= "Email: {$args['email']}\n";
            $body .= "Message: {$args['message']}\n";
            
            $mail_sent = wp_mail($to, $subject, $body);
            
            return [
                'success' => true,
                'message' => 'Form submitted successfully'
            ];
        }
    ]);
});

// Add support for menu locations in GraphQL
add_action('after_setup_theme', function() {
    register_nav_menus([
        'primary' => __('Primary Menu', 'mardenseo'),
        'footer' => __('Footer Menu', 'mardenseo'),
    ]);
});

// Make sure JWT authentication is configured correctly
// Add this to wp-config.php:
// define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'your-strong-secret-key');
// define('JWT_AUTH_CORS_ENABLE', true);

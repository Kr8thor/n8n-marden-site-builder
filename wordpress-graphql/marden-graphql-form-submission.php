<?php
/**
 * Plugin Name: Marden GraphQL Form Submission
 * Description: Adds a custom form submission mutation to WPGraphQL
 * Version: 1.0
 * Author: Marden SEO Team
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Register Form Submission custom post type
function marden_register_form_submission_post_type() {
    register_post_type('form_submission', [
        'labels' => [
            'name' => 'Form Submissions',
            'singular_name' => 'Form Submission',
        ],
        'public' => false,
        'show_ui' => true,
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_position' => 25,
        'supports' => ['title', 'custom-fields'],
        'show_in_graphql' => true,
        'graphql_single_name' => 'formSubmission',
        'graphql_plural_name' => 'formSubmissions',
    ]);
}
add_action('init', 'marden_register_form_submission_post_type');

// Add a custom GraphQL field for form submission
function marden_register_form_submission_field() {
    register_graphql_field('RootMutation', 'submitForm', [
        'description' => 'Submit a contact form',
        'type' => 'Boolean',
        'args' => [
            'name' => [
                'type' => 'String',
                'description' => 'Sender name',
            ],
            'email' => [
                'type' => 'String',
                'description' => 'Sender email',
            ],
            'message' => [
                'type' => 'String',
                'description' => 'Message content',
            ],
        ],
        'resolve' => function($root, $args) {
            // Validate required fields
            if (empty($args['name']) || empty($args['email']) || empty($args['message'])) {
                throw new \GraphQL\Error\UserError('Missing required fields');
            }
            
            // Validate email format
            if (!is_email($args['email'])) {
                throw new \GraphQL\Error\UserError('Invalid email address');
            }
            
            // Create form submission post
            $post_id = wp_insert_post([
                'post_type' => 'form_submission',
                'post_title' => sanitize_text_field($args['name']) . ' - ' . current_time('mysql'),
                'post_status' => 'publish',
                'meta_input' => [
                    'sender_name' => sanitize_text_field($args['name']),
                    'sender_email' => sanitize_email($args['email']),
                    'message' => sanitize_textarea_field($args['message']),
                    'submission_date' => current_time('mysql'),
                ],
            ]);
            
            if (is_wp_error($post_id)) {
                throw new \GraphQL\Error\UserError('Failed to save form submission');
            }
            
            // Optional: Send email notification
            $admin_email = get_option('admin_email');
            $subject = 'New Form Submission from ' . $args['name'];
            $body = "Name: {$args['name']}\n";
            $body .= "Email: {$args['email']}\n";
            $body .= "Message: {$args['message']}\n";
            
            wp_mail($admin_email, $subject, $body);
            
            return true;
        }
    ]);
}
add_action('graphql_register_types', 'marden_register_form_submission_field');

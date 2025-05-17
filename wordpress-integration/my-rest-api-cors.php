<?php
/**
 * Plugin Name: My REST API CORS
 * Plugin URI: https://mardenseo.com
 * Description: CORS support for REST API with custom security headers
 * Version: 1.0.0
 * Author: MardenSEO
 * Author URI: https://mardenseo.com
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Add CORS headers to REST API responses
 */
function my_rest_api_cors_handler() {
    // Remove default CORS headers
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );

    // Add custom CORS headers
    add_filter( 'rest_pre_serve_request', function( $value ) {
        // Allow requests from the main site and local development
        $allowed_origins = array(
            'https://mardenseo.com',
            'https://www.mardenseo.com',
            'https://staging.mardenseo.com',
            'http://localhost:3000',
            'http://localhost:5173'
        );

        $origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';

        if ( in_array( $origin, $allowed_origins ) ) {
            header( 'Access-Control-Allow-Origin: ' . $origin );
        } else {
            // Default to main site if origin is not in allowed list
            header( 'Access-Control-Allow-Origin: https://mardenseo.com' );
        }

        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-API-SECRET' );
        
        return $value;
    }, 15 );
}
add_action( 'rest_api_init', 'my_rest_api_cors_handler', 15 );

/**
 * Handle form submissions through REST API
 */
function register_form_submission_endpoint() {
    register_rest_route( 'myapp/v1', '/form-submission', array(
        'methods'             => 'POST',
        'callback'            => 'handle_form_submission',
        'permission_callback' => function() {
            // Check for API secret if enabled
            if ( defined( 'API_SECRET_KEY' ) && ! empty( API_SECRET_KEY ) ) {
                $secret_header = isset( $_SERVER['HTTP_X_API_SECRET'] ) ? $_SERVER['HTTP_X_API_SECRET'] : '';
                return $secret_header === API_SECRET_KEY;
            }
            
            // If no API secret is defined, allow all form submissions
            return true;
        },
        'args'                => array(
            'name'    => array(
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'email'   => array(
                'required'          => true,
                'validate_callback' => function( $param ) {
                    return is_email( $param );
                },
            ),
            'message' => array(
                'required'          => true,
                'sanitize_callback' => 'sanitize_textarea_field',
            ),
        ),
    ) );
}
add_action( 'rest_api_init', 'register_form_submission_endpoint' );

/**
 * Process form submission
 *
 * @param WP_REST_Request $request Full data about the request.
 * @return WP_REST_Response|WP_Error Response object on success, or error object on failure.
 */
function handle_form_submission( $request ) {
    $params = $request->get_params();
    
    $name    = sanitize_text_field( $params['name'] );
    $email   = sanitize_email( $params['email'] );
    $message = sanitize_textarea_field( $params['message'] );
    
    // Optional: Add additional form fields
    $subject = isset( $params['subject'] ) ? sanitize_text_field( $params['subject'] ) : 'New Website Form Submission';
    $phone   = isset( $params['phone'] ) ? sanitize_text_field( $params['phone'] ) : '';
    
    // Store form submission as a custom post type or send an email
    $submission_id = store_form_submission( $name, $email, $message, $subject, $phone );
    
    if ( is_wp_error( $submission_id ) ) {
        return new WP_Error( 'form_submission_failed', $submission_id->get_error_message(), array( 'status' => 500 ) );
    }
    
    // Send notification email
    $email_sent = send_form_notification( $name, $email, $message, $subject, $phone );
    
    // Return success response
    return rest_ensure_response( array(
        'success'   => true,
        'message'   => 'Form submission received successfully.',
        'id'        => $submission_id,
        'emailSent' => $email_sent,
    ) );
}

/**
 * Store form submission in database
 *
 * @param string $name Name from the form
 * @param string $email Email from the form
 * @param string $message Message from the form
 * @param string $subject Subject from the form
 * @param string $phone Phone from the form
 * @return int|WP_Error The post ID on success or WP_Error on failure
 */
function store_form_submission( $name, $email, $message, $subject, $phone ) {
    // Check if we need to create a custom post type first
    if ( ! post_type_exists( 'form_submission' ) ) {
        register_post_type( 'form_submission', array(
            'labels'       => array(
                'name'          => 'Form Submissions',
                'singular_name' => 'Form Submission',
            ),
            'public'       => false,
            'has_archive'  => false,
            'show_ui'      => true,
            'show_in_menu' => true,
            'supports'     => array( 'title', 'editor', 'custom-fields' ),
            'menu_icon'    => 'dashicons-email-alt',
        ) );
    }
    
    // Create post object
    $submission = array(
        'post_title'   => 'Form Submission - ' . $name,
        'post_content' => $message,
        'post_status'  => 'publish',
        'post_type'    => 'form_submission',
    );
    
    // Insert the post into the database
    $submission_id = wp_insert_post( $submission );
    
    if ( ! is_wp_error( $submission_id ) ) {
        // Add post meta
        add_post_meta( $submission_id, 'form_name', $name );
        add_post_meta( $submission_id, 'form_email', $email );
        add_post_meta( $submission_id, 'form_phone', $phone );
        add_post_meta( $submission_id, 'form_subject', $subject );
        add_post_meta( $submission_id, 'form_message', $message );
        add_post_meta( $submission_id, 'form_date', current_time( 'mysql' ) );
        add_post_meta( $submission_id, 'form_ip', $_SERVER['REMOTE_ADDR'] );
    }
    
    return $submission_id;
}

/**
 * Send notification email about the form submission
 *
 * @param string $name Name from the form
 * @param string $email Email from the form
 * @param string $message Message from the form
 * @param string $subject Subject from the form
 * @param string $phone Phone from the form
 * @return bool Whether the email was sent successfully
 */
function send_form_notification( $name, $email, $message, $subject, $phone ) {
    $to = get_option( 'admin_email' );
    
    // Email subject
    $email_subject = 'New Form Submission: ' . $subject;
    
    // Email headers
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . get_bloginfo( 'name' ) . ' <' . $to . '>',
        'Reply-To: ' . $name . ' <' . $email . '>',
    );
    
    // Email body
    $email_body = '<h2>New Form Submission</h2>';
    $email_body .= '<p><strong>Name:</strong> ' . $name . '</p>';
    $email_body .= '<p><strong>Email:</strong> ' . $email . '</p>';
    
    if ( ! empty( $phone ) ) {
        $email_body .= '<p><strong>Phone:</strong> ' . $phone . '</p>';
    }
    
    $email_body .= '<p><strong>Subject:</strong> ' . $subject . '</p>';
    $email_body .= '<h3>Message:</h3>';
    $email_body .= '<p>' . nl2br( $message ) . '</p>';
    $email_body .= '<hr>';
    $email_body .= '<p><em>This message was sent from the contact form on ' . get_bloginfo( 'name' ) . ' (' . get_bloginfo( 'url' ) . ')</em></p>';
    
    // Send email
    $sent = wp_mail( $to, $email_subject, $email_body, $headers );
    
    return $sent;
}

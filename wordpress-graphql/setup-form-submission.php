<?php
/**
 * WordPress GraphQL Form Submission Setup
 * 
 * This script adds the necessary code to enable form submissions via GraphQL.
 * It creates a custom post type for form submissions and registers a GraphQL mutation.
 * Upload this file to your WordPress site and run it once by visiting it in a browser.
 * For security, delete the file immediately after use.
 */

// WordPress initialization - adjust the path if necessary
require_once('../wp-load.php');

/**
 * Check if the necessary plugins are active
 */
function check_required_plugins() {
    $required_plugins = [
        'WPGraphQL' => 'wp-graphql/wp-graphql.php',
    ];
    
    $missing_plugins = [];
    
    foreach ($required_plugins as $name => $plugin) {
        if (!is_plugin_active($plugin)) {
            $missing_plugins[] = $name;
        }
    }
    
    return [
        'all_active' => empty($missing_plugins),
        'missing' => $missing_plugins
    ];
}

/**
 * Add form submission code to functions.php
 */
function add_form_submission_code() {
    // This is the code we want to add to functions.php
    $code = <<<'EOD'
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
EOD;

    // Get the theme's functions.php path
    $theme_dir = get_template_directory();
    $functions_file = $theme_dir . '/functions.php';
    
    // Safety check - make sure the file exists
    if (!file_exists($functions_file)) {
        return [
            'success' => false,
            'message' => 'functions.php file not found at: ' . $functions_file
        ];
    }
    
    // Check if the code is already in functions.php
    $current_content = file_get_contents($functions_file);
    if (strpos($current_content, 'marden_register_form_submission_post_type') !== false) {
        return [
            'success' => false,
            'message' => 'Form submission code already exists in functions.php'
        ];
    }
    
    // Create a backup of functions.php
    $backup_file = $theme_dir . '/functions.php.backup.' . date('YmdHis');
    if (!copy($functions_file, $backup_file)) {
        return [
            'success' => false,
            'message' => 'Failed to create backup of functions.php'
        ];
    }
    
    // Append the code to functions.php
    $result = file_put_contents($functions_file, $current_content . "\n\n" . $code);
    
    if ($result === false) {
        return [
            'success' => false,
            'message' => 'Failed to update functions.php'
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Form submission code added to functions.php',
        'backup' => $backup_file
    ];
}

/**
 * Create a plugin instead if functions.php can't be modified
 */
function create_form_submission_plugin() {
    // Plugin content
    $plugin_content = <<<'EOD'
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
EOD;

    // Plugin path
    $plugins_dir = WP_PLUGIN_DIR;
    $plugin_dir = $plugins_dir . '/marden-graphql-form-submission';
    $plugin_file = $plugin_dir . '/marden-graphql-form-submission.php';
    
    // Create plugin directory if it doesn't exist
    if (!file_exists($plugin_dir)) {
        if (!mkdir($plugin_dir, 0755, true)) {
            return [
                'success' => false,
                'message' => 'Failed to create plugin directory: ' . $plugin_dir
            ];
        }
    }
    
    // Write plugin file
    $result = file_put_contents($plugin_file, $plugin_content);
    
    if ($result === false) {
        return [
            'success' => false,
            'message' => 'Failed to create plugin file: ' . $plugin_file
        ];
    }
    
    // Try to activate the plugin
    $activate_result = activate_plugin('marden-graphql-form-submission/marden-graphql-form-submission.php');
    
    if (is_wp_error($activate_result)) {
        return [
            'success' => false,
            'message' => 'Failed to activate plugin: ' . $activate_result->get_error_message(),
            'plugin_created' => true,
            'plugin_path' => $plugin_file
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Form submission plugin created and activated',
        'plugin_path' => $plugin_file
    ];
}

// Security check - this helps prevent this script from being run by unauthorized users
$security_key = isset($_GET['key']) ? $_GET['key'] : '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>WordPress GraphQL Form Submission Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto; }
        .note { background: #ffffcc; padding: 10px; border-radius: 4px; }
        .code-block { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto; max-height: 400px; }
    </style>
</head>
<body>
    <h1>WordPress GraphQL Form Submission Setup</h1>
    
    <?php if (empty($security_key)): ?>
        <form method="get">
            <p>Enter security key to continue:</p>
            <input type="text" name="key" required>
            <button type="submit">Submit</button>
        </form>
    <?php elseif ($security_key === 'marden-seo-2025'): // Change this to a secure key ?>
        <div class="success">Authentication successful</div>
        <hr>
        
        <h2>1. Plugin Check</h2>
        <?php 
            if (!function_exists('is_plugin_active')) {
                include_once(ABSPATH . 'wp-admin/includes/plugin.php');
            }
            
            $plugin_check = check_required_plugins();
            if ($plugin_check['all_active']): 
        ?>
            <div class="success">✅ All required plugins are active.</div>
        <?php else: ?>
            <div class="error">❌ Missing required plugins: <?php echo implode(', ', $plugin_check['missing']); ?></div>
            <p>Please install and activate the required plugins before continuing.</p>
        <?php endif; ?>
        
        <h2>2. Setup Form Submission</h2>
        
        <?php if (!$plugin_check['all_active']): ?>
            <div class="warning">⚠️ Please install the required plugins first.</div>
        <?php else: ?>
            <p>Choose a method to add the form submission functionality:</p>
            
            <?php if (isset($_GET['method'])): ?>
                <?php if ($_GET['method'] === 'functions'): ?>
                    <h3>Adding to functions.php</h3>
                    <?php 
                        $result = add_form_submission_code();
                        if ($result['success']):
                    ?>
                        <div class="success">✅ <?php echo $result['message']; ?></div>
                        <p>A backup of your original functions.php has been created at:<br> <code><?php echo $result['backup']; ?></code></p>
                    <?php else: ?>
                        <div class="error">❌ <?php echo $result['message']; ?></div>
                        <p>Please try the plugin method instead.</p>
                        <a href="?key=<?php echo htmlspecialchars($security_key); ?>&method=plugin" class="button">Create Plugin Instead</a>
                    <?php endif; ?>
                    
                <?php elseif ($_GET['method'] === 'plugin'): ?>
                    <h3>Creating Plugin</h3>
                    <?php 
                        $result = create_form_submission_plugin();
                        if ($result['success']):
                    ?>
                        <div class="success">✅ <?php echo $result['message']; ?></div>
                        <p>Plugin file created at:<br> <code><?php echo $result['plugin_path']; ?></code></p>
                    <?php elseif (isset($result['plugin_created']) && $result['plugin_created']): ?>
                        <div class="warning">⚙️ Plugin file created but not activated: <?php echo $result['message']; ?></div>
                        <p>Plugin file created at:<br> <code><?php echo $result['plugin_path']; ?></code></p>
                        <p>Please activate the plugin manually from the WordPress admin dashboard.</p>
                    <?php else: ?>
                        <div class="error">❌ <?php echo $result['message']; ?></div>
                        <p>Failed to create the plugin. Please try adding the code manually.</p>
                        
                        <h4>Manual Installation Steps:</h4>
                        <ol>
                            <li>Create a new folder called <code>marden-graphql-form-submission</code> in your WordPress plugins directory</li>
                            <li>Create a file named <code>marden-graphql-form-submission.php</code> in that folder</li>
                            <li>Copy and paste the following code into that file:</li>
                        </ol>
                        
                        <div class="code-block">
                            <pre><?php echo htmlspecialchars(create_form_submission_plugin()['plugin_content']); ?></pre>
                        </div>
                        
                        <li>Activate the plugin from the WordPress admin dashboard</li>
                    <?php endif; ?>
                    
                <?php endif; ?>
            <?php else: ?>
                <div class="buttons">
                    <a href="?key=<?php echo htmlspecialchars($security_key); ?>&method=functions" class="button">Add to functions.php</a>
                    <a href="?key=<?php echo htmlspecialchars($security_key); ?>&method=plugin" class="button">Create Plugin</a>
                </div>
            <?php endif; ?>
        <?php endif; ?>
        
        <hr>
        <div class="note">
            <p><strong>Important:</strong> For security reasons, please delete this file immediately after use.</p>
        </div>
    <?php else: ?>
        <div class="error">Invalid security key.</div>
    <?php endif; ?>
</body>
</html>

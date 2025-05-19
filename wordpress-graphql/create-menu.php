<?php
/**
 * WordPress Menu Creation Script
 * 
 * This script creates a Primary Menu in WordPress with common navigation items.
 * Upload this file to your WordPress site and run it once by visiting it in a browser.
 * For security, delete the file immediately after use.
 */

// WordPress initialization - adjust the path if necessary
require_once('../wp-load.php');

// Function to create a sample navigation menu
function create_primary_navigation_menu() {
    // Check if menu already exists
    $menu_name = 'Primary Menu';
    $menu_exists = wp_get_nav_menu_object($menu_name);
    
    if (!$menu_exists) {
        // Create menu
        $menu_id = wp_create_nav_menu($menu_name);
        
        if (is_wp_error($menu_id)) {
            echo '<p>Error creating menu: ' . $menu_id->get_error_message() . '</p>';
            return;
        }
        
        // Add menu items
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Home',
            'menu-item-url' => home_url('/'),
            'menu-item-status' => 'publish',
            'menu-item-position' => 1,
        ]);
        
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'About',
            'menu-item-url' => home_url('/about/'),
            'menu-item-status' => 'publish',
            'menu-item-position' => 2,
        ]);
        
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Services',
            'menu-item-url' => home_url('/services/'),
            'menu-item-status' => 'publish',
            'menu-item-position' => 3,
        ]);
        
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Blog',
            'menu-item-url' => home_url('/blog/'),
            'menu-item-status' => 'publish',
            'menu-item-position' => 4,
        ]);
        
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Contact',
            'menu-item-url' => home_url('/contact/'),
            'menu-item-status' => 'publish',
            'menu-item-position' => 5,
        ]);
        
        // Assign menu to primary location
        $locations = get_theme_mod('nav_menu_locations');
        if (!is_array($locations)) {
            $locations = [];
        }
        $locations['primary'] = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);
        
        echo '<p>✅ Primary navigation menu created successfully!</p>';
        echo '<p>Menu ID: ' . $menu_id . '</p>';
        echo '<p>Items added: Home, About, Services, Blog, Contact</p>';
        echo '<p>The menu has been assigned to the primary location.</p>';
    } else {
        echo '<p>⚠️ Primary menu already exists (ID: ' . $menu_exists->term_id . ').</p>';
    }
}

// Security check - this helps prevent this script from being run by unauthorized users
// In a real-world scenario, you would want to use a more secure authentication method
$security_key = isset($_GET['key']) ? $_GET['key'] : '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>WordPress Menu Creation</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
        .note { background: #ffffcc; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>WordPress Menu Creation Tool</h1>
    
    <?php if (empty($security_key)): ?>
        <form method="get">
            <p>Enter security key to continue:</p>
            <input type="text" name="key" required>
            <button type="submit">Submit</button>
        </form>
    <?php elseif ($security_key === 'marden-seo-2025'): // Change this to a secure key ?>
        <div class="success">Authentication successful</div>
        <hr>
        <h2>Creating Primary Navigation Menu</h2>
        <?php create_primary_navigation_menu(); ?>
        
        <hr>
        <div class="note">
            <p><strong>Important:</strong> For security reasons, please delete this file immediately after use.</p>
        </div>
    <?php else: ?>
        <div class="error">Invalid security key.</div>
    <?php endif; ?>
</body>
</html>

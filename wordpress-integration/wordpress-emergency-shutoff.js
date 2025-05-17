/**
 * WordPress Integration Emergency Shutoff
 * This script disables all WordPress API integration functionality
 * Add this BEFORE the wordpress-integration.js script in case of emergency
 */
(function() {
  // Disable WordPress integration immediately
  if (window.WordPressAPI) {
    // If the API is already loaded, disable it
    window.WordPressAPI.setEnabled(false);
    console.warn('WordPress Integration has been emergency disabled');
  }
  
  // Prevent the integration from being enabled
  window.WORDPRESS_API_CONFIG = {
    ENABLED: false,
    EMERGENCY_SHUTOFF: true
  };
  
  // Create a global variable to indicate shutoff status
  window.WP_INTEGRATION_EMERGENCY_SHUTOFF = true;
  
  console.warn('WordPress Integration Emergency Shutoff is active');
})();
/**
 * WordPress Integration for React Frontend
 * This script provides a connection between a React frontend and WordPress backend via n8n middleware
 */

const WordPressAPI = (function() {
  // Configuration
  const config = {
    apiUrl: '/api', // Path to n8n webhooks (will be proxied in production)
    debug: false,   // Enable for console logging
  };

  /**
   * Log messages when debug mode is enabled
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  const log = (message, data) => {
    if (config.debug) {
      console.log(`[WordPress API]: ${message}`, data || '');
    }
  };

  /**
   * Fetch content from WordPress
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.perPage - Items per page
   * @param {string} options.contentType - Content type (posts, pages, etc)
   * @returns {Promise} - Content data
   */
  const fetchContent = async (options = {}) => {
    const defaults = {
      page: 1,
      perPage: 10,
      contentType: 'posts',
    };
    
    const params = { ...defaults, ...options };
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    try {
      log('Fetching content', params);
      const response = await fetch(`${config.apiUrl}/content?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      log('Content received', data);
      return data;
    } catch (error) {
      log('Error fetching content', error);
      throw error;
    }
  };
  
  /**
   * Submit a form to WordPress
   * @param {Object} formData - Form data to submit
   * @returns {Promise} - Submission result
   */
  const submitForm = async (formData) => {
    try {
      log('Submitting form', formData);
      
      const response = await fetch(`${config.apiUrl}/forms/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          siteUrl: 'https://cms.mardenseo.com' // Set your WordPress site URL here
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form submission failed');
      }
      
      const result = await response.json();
      log('Form submitted successfully', result);
      return result;
    } catch (error) {
      log('Error submitting form', error);
      throw error;
    }
  };
  
  /**
   * Authenticate with WordPress
   * @param {string} username - WordPress username
   * @param {string} password - WordPress password
   * @returns {Promise} - Authentication result with token
   */
  const login = async (username, password) => {
    try {
      log('Authenticating user', { username });
      
      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          siteUrl: 'https://cms.mardenseo.com' // Set your WordPress site URL here
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const authData = await response.json();
      
      if (authData.token) {
        localStorage.setItem('wp_auth_token', authData.token);
        log('Authentication successful');
      }
      
      return authData;
    } catch (error) {
      log('Authentication error', error);
      throw error;
    }
  };
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  const isAuthenticated = () => {
    return !!localStorage.getItem('wp_auth_token');
  };
  
  /**
   * Log out the current user
   */
  const logout = () => {
    localStorage.removeItem('wp_auth_token');
    log('User logged out');
  };
  
  /**
   * Set API configuration
   * @param {Object} newConfig - Configuration options
   */
  const setConfig = (newConfig) => {
    Object.assign(config, newConfig);
    log('Configuration updated', config);
  };
  
  // Public API
  return {
    fetchContent,
    submitForm,
    login,
    logout,
    isAuthenticated,
    setConfig,
  };
})();

// Auto-initialize with debug enabled in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  WordPressAPI.setConfig({ debug: true });
}

// Make available globally
window.WordPressAPI = WordPressAPI;

/**
 * WordPress Integration for Marden SEO
 * Provides seamless API connections between React frontend and WordPress backend
 * via n8n middleware
 */

(function() {
    // Configuration
    const API_BASE_URL = 'https://api.mardenseo.com'; // Change to your n8n webhook URL or path
    const API_SECRET = 'marden-api-secret'; // This should match the secret in WordPress and n8n
    
    // Token storage keys
    const TOKEN_STORAGE_KEY = 'marden_auth_token';
    const TOKEN_EXPIRY_KEY = 'marden_auth_expiry';
    
    /**
     * Makes API requests to n8n middleware
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Request options
     * @returns {Promise} - Fetch promise
     */
    async function apiRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'X-API-SECRET': API_SECRET
        };
        
        // Add authentication token if available and not expired
        if (isAuthenticated()) {
            headers['Authorization'] = `Bearer ${getToken()}`;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...(options.headers || {})
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: `API error: ${response.status} ${response.statusText}`
                }));
                throw new Error(errorData.message || 'Unknown API error');
            }
            
            return response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Check if user is authenticated with valid token
     * @returns {boolean} - Authentication status
     */
    function isAuthenticated() {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        
        if (!token || !expiry) {
            return false;
        }
        
        // Check if token is expired
        const expiryDate = new Date(expiry);
        const now = new Date();
        
        return expiryDate > now;
    }
    
    /**
     * Get the stored authentication token
     * @returns {string|null} - Authentication token
     */
    function getToken() {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    }
    
    /**
     * Store authentication token and expiry
     * @param {string} token - JWT token
     * @param {number} expiresIn - Expiry time in seconds
     */
    function storeToken(token, expiresIn = 86400) {
        const now = new Date();
        const expiry = new Date(now.getTime() + expiresIn * 1000);
        
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toISOString());
    }
    
    /**
     * WordPress integration API
     */
    window.WordPressAPI = {
        /**
         * Fetch posts from WordPress
         * @param {number} page - Page number
         * @param {number} perPage - Items per page
         * @returns {Promise} - Posts data
         */
        getPosts: async (page = 1, perPage = 10) => {
            return apiRequest('/api/content', {
                method: 'GET',
            });
        },
        
        /**
         * Get menu structure from WordPress
         * @returns {Promise} - Menu data
         */
        getMenu: async () => {
            return apiRequest('/api/menu', {
                method: 'GET'
            });
        },
        
        /**
         * Submit contact form data
         * @param {Object} formData - Form data to submit
         * @returns {Promise} - Submission result
         */
        submitContactForm: async (formData) => {
            return apiRequest('/api/forms/submit', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        },
        
        /**
         * Authenticate user with WordPress
         * @param {string} username - WordPress username
         * @param {string} password - WordPress password
         * @returns {Promise} - Authentication result with token
         */
        login: async (username, password) => {
            try {
                const result = await apiRequest('/api/auth', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });
                
                if (result.token) {
                    storeToken(result.token, result.expires_in || 86400);
                }
                
                return result;
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },
        
        /**
         * Logout user by clearing stored tokens
         */
        logout: () => {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(TOKEN_EXPIRY_KEY);
        },
        
        /**
         * Check if user is authenticated
         * @returns {boolean} - Authentication status
         */
        isAuthenticated
    };
    
    /**
     * Auto-initialize forms when DOM is loaded
     */
    document.addEventListener('DOMContentLoaded', () => {
        // Find all forms with data-wp-form attribute
        const forms = document.querySelectorAll('[data-wp-form="contact"]');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Clear previous messages
                const previousMessages = form.querySelectorAll('.form-message');
                previousMessages.forEach(el => el.remove());
                
                const submitButton = form.querySelector('[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                // Get form data
                const formData = {};
                const formElements = form.querySelectorAll('input, textarea, select');
                formElements.forEach(element => {
                    if (element.name) {
                        formData[element.name] = element.value;
                    }
                });
                
                try {
                    const result = await window.WordPressAPI.submitContactForm(formData);
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-message form-success-message';
                    successMessage.textContent = result.message || 'Thank you for your message! We\'ll get back to you soon.';
                    form.appendChild(successMessage);
                    
                    // Reset form
                    form.reset();
                } catch (error) {
                    // Show error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'form-message form-error-message';
                    errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
                    form.appendChild(errorMessage);
                } finally {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
            });
        });
    });
})();
